import 'reflect-metadata';
import { Container } from 'typedi';
import Moment from 'moment';
import { Controller, JsonController, Param, Get } from 'routing-controllers';
import { BaseController } from './BaseController';
import { Platform, Weekday } from '../model/Enum';
import {
  platformDaytype,
  platformKorToEng,
  weekDayKorToEng,
} from '../model/Object';
import { config } from '../config/config';
import {
  BaseService,
  NaverService,
  DaumService,
  KakaoService,
  LezhinService,
  ToomicsService,
  ToptoonService,
  IwebtoonDTO,
  MisterblueService,
} from '../service';
// import { debug } from 'winston';

//firebase import
import admin from 'firebase-admin';

// firebase admin initialize
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  storageBucket: 'toonmark-api.appspot.com',
});

// set bucket storage
const bucket = admin.storage().bucket();

// set platform regex
const platformregex = 'daum|naver|kakao|lezhin|toomics|toptoon|misterblue';

// const dataPath = path.join(config.rootpath, config.datapath);

// @Controller('/webtoon')
@JsonController('/webtoon')
export class WebtoonController extends BaseController {
  serviceSelector = (platform: Platform): BaseService => {
    try {
      switch (platform) {
        case Platform.NAVER:
          return Container.get(NaverService);
        case Platform.DAUM:
          return Container.get(DaumService);
        case Platform.KAKAO:
          return Container.get(KakaoService);
        case Platform.LEZHIN:
          return Container.get(LezhinService);
        case Platform.TOOMICS:
          return Container.get(ToomicsService);
        case Platform.TOPTOON:
          return Container.get(ToptoonService);
        case Platform.MISTERBLUE:
          return Container.get(MisterblueService);
        default:
          throw new Error('not supported Platform');
      }
    } catch (error) {
      console.error(error);
    }
  };

  @Get('/test')
  test = async () => {
    return {
      hi: 'this is test page',
    };
  };

  // to firebase storage function
  dataFileChecker = async (
    file: string,
    weekday?: string,
  ): Promise<boolean> => {
    try {
      //create data file when the file doesn't exists.

      const isFileExists = await bucket.file(file).exists();

      if (!isFileExists[0]) {
        // console.log('dataFileChecker 0');

        await bucket.file(file).save('[]', { contentType: config.contentType });

        // console.log('dataFileChecker 1');

        return true;
      }

      // console.log('dataFileChecker 2');

      const [meta] = await bucket.file(file).getMetadata();
      const fileUpdatedHour = Moment(meta.updated)
        .utc()
        .hour();

      const currentTime = Moment().utc();
      const today = currentTime.format('ddd').toLowerCase();
      const elapsedTimeOfData = currentTime.diff(Moment(meta.updated), 'hour');

      // File Check Policy
      if (meta.size <= 10) return true; // check data is empty
      if (
        currentTime.hour() >= Number(config.refreshHour) - 9 &&
        currentTime.minute() >= Number(config.refreshMinutes) &&
        fileUpdatedHour < Number(config.refreshHour) - 9 &&
        (weekday === undefined || weekday === today)
      )
        return true; // 시간이 11시 이후이고 파일 생성 시간이 11시 이전이며 전체 목록 요청 또는 당일 목록 요청일 경우
      if (elapsedTimeOfData >= config.oldDataHourLimit) return true; //check data is old

      // console.log('dataFileChecker 3');

      return false;
    } catch (error) {
      console.error(error);
      return;
    }
  };

  dataIntegration = async (
    data: IwebtoonDTO[],
    platform: Platform,
  ): Promise<boolean> => {
    try {
      const file = `${config.dataPath}/${platform}/${platform}_all${config.dataType}`;

      // check file is exists
      const isFileExists = await bucket.file(file).exists();
      if (!isFileExists[0]) {
        await bucket.file(file).save('[]', { contentType: config.contentType });
      }

      // get total data file's data
      const filedata: IwebtoonDTO[] = JSON.parse(
        (await bucket.file(file).download({ validation: false })).toString(),
      );

      // check file data is lastest
      const isLastest = data.reduce((prev, cur) => {
        const targetData = filedata.filter((target) => {
          return cur.title === target.title;
        });

        if (targetData.length == 0) return prev || true;
        if (cur.isUp != targetData[0].isUp) return prev || true;
        if (cur.isBreak != targetData[0].isBreak) return prev || true;

        return prev || false;
      }, false);

      // data sorting
      if (isLastest) {
        const buf = JSON.stringify(
          this.getUniqueData(
            data.concat(
              filedata.map((val) => {
                val.isUp = false;
                return val;
              }),
            ),
            'title',
          ),
        );

        // data save
        await bucket.file(file).save(buf, { contentType: config.contentType });

        return true;
      }

      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  getUniqueData(
    data: IwebtoonDTO[],
    criteria: keyof IwebtoonDTO,
  ): IwebtoonDTO[] {
    return data.filter((src: IwebtoonDTO, srcIndex) => {
      return (
        data.findIndex((target) => {
          return src[criteria] === target[criteria];
        }) === srcIndex
      );
    });
  }

  setAfterRequestFailure = async (
    file: string,
  ): Promise<IwebtoonDTO[] | string> => {
    const [meta] = await bucket.file(file).getMetadata();

    if (meta.size < 10) {
      await bucket.file(file).delete();

      return 'Request FAILED';
    }

    return JSON.parse(
      (await bucket.file(file).download({ validation: false })).toString(),
    );
  };

  @Get(`/:platform(${platformregex})`)
  public async getList(
    @Param('platform') platform: Platform,
  ): Promise<IwebtoonDTO[] | string> {
    try {
      console.log(`Request ${platform}`);

      const container = this.serviceSelector(platform);

      const file = `${config.dataPath}/${platform}/${platform}_all${config.dataType}`;

      // console.log('getList - 1');

      const fileCheck = await this.dataFileChecker(file);

      // console.log('getList - 2');

      if (fileCheck) {
        // console.log('getList - 2 - 1');

        const info = await container.getInfo();

        // console.log('getList - 2 - 2');

        const filedata: IwebtoonDTO[] = JSON.parse(
          (await bucket.file(file).download({ validation: false })).toString(),
        );

        // console.log('getList - 2 - 3');

        // await bucket
        //   .file(`${config.dataPath}/debug_from_all1.txt`)
        //   .save(info, { contentType: config.contentType });

        if (info.includes(undefined) || info === undefined) {
          const result = await this.setAfterRequestFailure(file);

          // console.log('getList - 2 - 4');

          // await bucket
          //   .file(`${config.dataPath}/debug_from_all2.txt`)
          //   .save(result, { contentType: config.contentType });

          return result;
        }

        const buf = JSON.stringify(
          this.getUniqueData(info.concat(filedata), 'title'),
        );

        await bucket.file(file).save(buf, { contentType: config.contentType });
      }

      // console.log('getList - 3');

      const data: IwebtoonDTO[] = JSON.parse(
        (await bucket.file(file).download({ validation: false })).toString(),
      );

      // console.log('getList - 4');

      return data;
    } catch (error) {
      return;
    }
  }

  @Get(`/:platform(${platformregex})/:weekday`)
  public async getDailyList(
    @Param('platform') platform: Platform,
    @Param('weekday') weekday: string,
  ): Promise<IwebtoonDTO[] | string> {
    try {
      // lower case
      weekday = weekday.toLowerCase();

      // check full name of weekday
      if (weekday.includes('day')) {
        const tmpstr = weekday.substr(0, 3);

        if (platformDaytype[platform].includes(tmpstr as Weekday))
          weekday = tmpstr;
      }

      // check full name of korean weekday
      if (weekday.includes('요일')) {
        const tmpstr = weekday.substr(0, 1);

        if (Object.keys(weekDayKorToEng).includes(tmpstr)) {
          weekday = tmpstr;
        }
      }

      // check korean weekday
      if (Object.keys(weekDayKorToEng).includes(weekday)) {
        weekday = weekDayKorToEng[weekday];
      }

      // check other word
      if (
        !Object.values(platformDaytype[platform]).includes(weekday as Weekday)
      ) {
        weekday = Moment()
          .format('ddd')
          .toLowerCase();
      }

      console.log(`Request ${platform}/${weekday}`);

      const container = this.serviceSelector(platform);

      const file = `${config.dataPath}/${platform}/${platform}_${weekday}${config.dataType}`;

      // console.log('check0');

      const fileCheck = await this.dataFileChecker(file, weekday);

      if (fileCheck) {
        // console.log('check0 - 1');

        const buf: string = JSON.stringify(await container.getInfo(weekday));

        // await bucket
        //   .file(`${config.dataPath}/debug.txt`)
        //   .save(buf, { contentType: config.contentType });

        if (buf === undefined) {
          const result = await this.setAfterRequestFailure(file);

          // await bucket
          //   .file(`${config.dataPath}/debug2.txt`)
          //   .save(result, { contentType: config.contentType });

          return result;
        }

        // console.log('check0 - 2');

        await bucket.file(file).save(buf, { contentType: config.contentType });

        // console.log('check0 - 3');
      }

      // console.log('check1');

      const data: IwebtoonDTO[] = JSON.parse(
        (await bucket.file(file).download({ validation: false })).toString(),
      );

      // console.log('check2');

      await this.dataIntegration(data, platform);

      // console.log('check3');

      return data;
    } catch (error) {
      console.error(error);
      return;
    }
  }

  @Get(`/search/:criteria`)
  public async getSearchData(@Param('criteria') criteria: string) {
    const [dataList] = await bucket.getFiles();

    const filteredList = dataList
      .map((file) => file.name)
      .filter((name) => name.includes(`all${config.dataType}`));

    const data = await filteredList.reduce(async (prev, cur) => {
      return (await prev).concat(
        JSON.parse(
          (await bucket.file(cur).download({ validation: false })).toString(),
        ),
      );
    }, Promise.resolve([]));

    const result = data.filter((val: IwebtoonDTO) => {
      if (val.title.includes(criteria)) return true;
      if (val.author.includes(criteria)) return true;
      if (val.genre.includes(criteria)) return true;
      if (val.platform.includes(criteria)) return true;
      if (val.platform.includes(platformKorToEng[criteria])) return true;
    });
    return result;
  }
}

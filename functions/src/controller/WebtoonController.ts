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

//firebase import

import admin, { credential } from 'firebase-admin';
// import spawn from 'child-process-promise';
// import fs from 'fs';
import path from 'path';
import { firebaseConfig } from 'firebase-functions';

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
      if (platform === Platform.NAVER) return Container.get(NaverService);
      else if (platform === Platform.DAUM) return Container.get(DaumService);
      else if (platform === Platform.KAKAO) return Container.get(KakaoService);
      else if (platform === Platform.LEZHIN)
        return Container.get(LezhinService);
      else if (platform === Platform.TOOMICS)
        return Container.get(ToomicsService);
      else if (platform === Platform.TOPTOON)
        return Container.get(ToptoonService);
      else if (platform === Platform.MISTERBLUE)
        return Container.get(MisterblueService);
    } catch (error) {
      console.error(error);
    }
  };

  @Get('/test')
  test = async () => {
    // const [test] = await bucket.getFiles();

    // return {
    //   list1: test.map((file) => file.name),
    //   list2: test
    //     .map((file) => file.name)
    //     .filter((name) => name.includes(`all${config.dataType}`)),
    //   // test: process.env.NODE_ENV ?? 'this is null',
    // };

    return { hi: 'this is test page', test: process.env.NODE_ENV };
    // return filedata;
  };

  // to firebase storage function
  dataFileChecker = async (file: string): Promise<boolean> => {
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

      const elapsedTimeOfData = Moment().diff(Moment(meta.updated), 'hour');

      if (meta.size <= 10) return true; // check data is empty
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
        (await bucket.file(file).download()).toString(),
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
  ): Promise<[boolean, IwebtoonDTO[] | string]> => {
    const [meta] = await bucket.file(file).getMetadata();

    if (meta.size < 10) {
      await bucket.file(file).delete();

      return [true, 'Request FAILED'];
    }

    return [
      true,
      JSON.parse(await (await bucket.file(file).download()).toString()),
    ];
  };

  @Get(`/:platform(${platformregex})`)
  public async getList(
    @Param('platform') platform: Platform,
  ): Promise<IwebtoonDTO[] | string> {
    try {
      const container = this.serviceSelector(platform);

      const file = `${config.dataPath}/${platform}/${platform}_all${config.dataType}`;

      const fileCheck = await this.dataFileChecker(file);

      if (fileCheck) {
        const info = await container.getInfo();

        const filedata: IwebtoonDTO[] = JSON.parse(
          (await bucket.file(file).download()).toString(),
        );

        if (info.includes(undefined)) {
          return (await this.setAfterRequestFailure(file))[1];
        }

        const buf = JSON.stringify(
          this.getUniqueData(info.concat(filedata), 'title'),
        );

        await bucket.file(file).save(buf, { contentType: config.contentType });
      }

      const data: IwebtoonDTO[] = JSON.parse(
        (await bucket.file(file).download()).toString(),
      );

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

      const container = this.serviceSelector(platform);

      const file = `${config.dataPath}/${platform}/${platform}_${weekday}${config.dataType}`;

      // console.log('check0');

      const fileCheck = await this.dataFileChecker(file);

      if (fileCheck) {
        // console.log('check0 - 1');

        const buf: string | [boolean, IwebtoonDTO[] | string] =
          JSON.stringify(await container.getInfo(weekday)) ??
          (await this.setAfterRequestFailure(file));

        if (buf[0] === true) return buf[1];

        // console.log('check0 - 2');

        await bucket.file(file).save(buf, { contentType: config.contentType });

        // console.log('check0 - 3');
      }

      // console.log('check1');

      const data: IwebtoonDTO[] = JSON.parse(
        (await bucket.file(file).download()).toString(),
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
        JSON.parse((await bucket.file(cur).download()).toString()),
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

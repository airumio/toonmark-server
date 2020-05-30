import 'reflect-metadata';
import { Container } from 'typedi';
import fs from 'fs';
import path from 'path';
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

const dataPath = path.join(config.rootpath, config.datapath);
const platformregex = 'daum|naver|kakao|lezhin|toomics|toptoon|misterblue';

/*
월요일 업 상태 -> all로 병합

화요일 업 상태 -> all로 병합 시 월요일은 false여야 하는데 여전히 true상태
*/

// @Controller('/webtoon')
@JsonController('/webtoon')
export class WebtoonController extends BaseController {
  serviceSelector = (platform: Platform): BaseService => {
    if (platform === Platform.NAVER) return Container.get(NaverService);
    else if (platform === Platform.DAUM) return Container.get(DaumService);
    else if (platform === Platform.KAKAO) return Container.get(KakaoService);
    else if (platform === Platform.LEZHIN) return Container.get(LezhinService);
    else if (platform === Platform.TOOMICS)
      return Container.get(ToomicsService);
    else if (platform === Platform.TOPTOON)
      return Container.get(ToptoonService);
    else if (platform === Platform.MISTERBLUE)
      return Container.get(MisterblueService);
  };

  @Get('/test')
  test = async () => {
    // const container = this.serviceSelector(Platform.LEZHIN);
    // const result = await container.getInfo();

    // const data: string = await foo(1, '');

    // const data = container.getInfo('mon');

    // return data;
    // throw new Error('Method not implemented.');
    const platform: string[] = [
      'naver',
      'daum',
      'kakao',
      'lezhin',
      'toomics',
      'toptoon',
      'misterblue',
    ];

    const sample = platform.map((e: keyof typeof platformDaytype) => {
      return platformDaytype[e].map((value) => {
        console.log(
          `Request url : https://asia-east2-toonmark-api.cloudfunctions.net/api/webtoon/${e}/${value}`,
        );

        return `Request url : https://asia-east2-toonmark-api.cloudfunctions.net/api/webtoon/${e}/${value}`;
      });
    });

    return {
      hi: 'this is test page',
      test: process.env.NODE_ENV,
      sample,
    };
    // return filedata;
  };

  dataFileChecker = (file: string): boolean => {
    try {
      //create data file when the file doesn't exists.
      if (!fs.existsSync(file)) {
        try {
          fs.mkdirSync(file.slice(0, file.lastIndexOf('/')));
        } catch (error) {
          if (error.code != 'EEXIST') throw error;
        }
        fs.appendFileSync(file, '[]');

        return true;
      }

      const filestat = fs.statSync(file);
      const elapsedTimeOfData: Date = new Date(
        Date.now() - filestat.mtime.getTime(),
      );

      if (filestat.size <= 10) return true; // check data is empty
      if (elapsedTimeOfData.getUTCHours() >= config.oldDataHourLimit)
        return true; //check data is old

      return false;
    } catch (error) {
      console.error(error);
      return;
    }
  };

  dataIntegration(data: IwebtoonDTO[], platform: Platform) {
    try {
      const file = `${dataPath}/${platform}/${platform}_all${config.dataType}`;

      if (!fs.existsSync(file)) {
        fs.appendFileSync(file, '[]');
      }

      const filedata: IwebtoonDTO[] = JSON.parse(fs.readFileSync(file, 'utf8'));

      const isFileOld = data.reduce((prev, cur) => {
        const targetData = filedata.filter((target) => {
          return cur.title === target.title;
        });

        if (targetData.length == 0) return prev || true;
        if (cur.isUp != targetData[0].isUp) return prev || true;
        if (cur.isBreak != targetData[0].isBreak) return prev || true;

        return prev || false;
      }, false);

      if (isFileOld) {
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

        fs.writeFileSync(file, buf, 'utf8');

        return true;
      }

      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

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

  setAfterRequestFailure = (
    file: string,
  ): [boolean, IwebtoonDTO[] | string] => {
    const filestat = fs.statSync(file);

    if (filestat.size < 10) {
      fs.unlinkSync(file);
      return [true, 'Request FAILED'];
    }

    return [true, JSON.parse(fs.readFileSync(file, 'utf8'))];
  };

  @Get(`/:platform(${platformregex})`)
  public async getList(
    @Param('platform') platform: Platform,
  ): Promise<IwebtoonDTO[] | string> {
    try {
      const container = this.serviceSelector(platform);
      const file = `${dataPath}/${platform}/${platform}_all${config.dataType}`;

      if (this.dataFileChecker(file)) {
        const info = await container.getInfo();

        const filedata: IwebtoonDTO[] = JSON.parse(
          fs.readFileSync(file, 'utf8'),
        );

        if (info.includes(undefined)) {
          return this.setAfterRequestFailure(file)[1];
        }

        const buf = JSON.stringify(
          this.getUniqueData(info.concat(filedata), 'title'),
        );

        fs.writeFileSync(file, buf, 'utf8');
      }

      const data: IwebtoonDTO[] = JSON.parse(fs.readFileSync(file, 'utf8'));

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
      const file = `${dataPath}/${platform}/${platform}_${weekday}${config.dataType}`;

      if (this.dataFileChecker(file)) {
        const buf: string | [boolean, IwebtoonDTO[] | string] =
          JSON.stringify(await container.getInfo(weekday)) ??
          this.setAfterRequestFailure(file);

        if (buf[0] === true) return buf[1];

        fs.writeFileSync(file, buf, 'utf8');
      }

      const data: IwebtoonDTO[] = JSON.parse(fs.readFileSync(file, 'utf8'));
      this.dataIntegration(data, platform);

      return data;
    } catch (error) {
      console.error(error);
      return;
    }
  }

  @Get(`/search/:criteria`)
  public async getSearchData(@Param('criteria') criteria: string) {
    const dataList = fs.readdirSync(dataPath);

    const data = dataList.reduce((prev, cur) => {
      return prev.concat(
        JSON.parse(
          fs.readFileSync(
            path.join(dataPath, cur, `${cur}_all${config.dataType}`),
            'utf8',
          ),
        ),
      );
    }, []);

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

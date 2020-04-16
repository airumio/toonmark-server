import 'reflect-metadata';
import { Container } from 'typedi';
import fs from 'fs';
import Moment from 'moment';
import { Controller, JsonController, Param, Get } from 'routing-controllers';
import { BaseController } from './BaseController';
import { Platform, Weekday } from '../model/Enum';
import { platformDaytype, platformKorToEng } from '../model/Object';
import Config from '../config/config.json';
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

const dataPath = __dirname + '\\..\\..\\src\\data';
const platformregex = 'daum|naver|kakao|lezhin|toomics|toptoon|misterblue';

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

    return { hi: 'this is test page' };
  };

  dataFileChecker = (file: string): boolean => {
    try {
      //create data.json file when the file doesn't exists.
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
      const tmp: Date = new Date(Date.now() - filestat.mtime.getTime());

      if (filestat.size <= 10) return true; // check data is empty
      if (tmp.getUTCHours() >= Config.oldDataLimit) return true; //check data is old

      return false;
    } catch (error) {
      console.error(error);
      return;
    }
  };

  dataIntegration(data: IwebtoonDTO[], platform: Platform) {
    try {
      const file = `${dataPath}/${platform}/${platform}_all.json`;

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

  @Get(`/:platform(${platformregex})`)
  public async getList(
    @Param('platform') platform: Platform,
  ): Promise<IwebtoonDTO[] | undefined> {
    try {
      const container = this.serviceSelector(platform);
      const file = `${dataPath}/${platform}/${platform}_all.json`;

      if (this.dataFileChecker(file)) {
        const info = await container.getInfo();
        const filedata: IwebtoonDTO[] = JSON.parse(
          fs.readFileSync(file, 'utf8'),
        );

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
  ): Promise<IwebtoonDTO[] | undefined> {
    try {
      if (
        !Object.values(platformDaytype[platform]).includes(weekday as Weekday)
      ) {
        weekday = Moment()
          .format('ddd')
          .toLowerCase();
      }

      const container = this.serviceSelector(platform);
      const file = `${dataPath}/${platform}/${platform}_${weekday}.json`;

      if (this.dataFileChecker(file)) {
        const buf: string = JSON.stringify(await container.getInfo(weekday));

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
  /*
  Search 메소드 설계

  data 폴더를 읽는다
  data 폴더 내부에 있는 폴더 수 만큼 반복 작업
    반복작업 내용
    1. 모든 내부폴더이름 + all.json의 파일을 읽어들인다(reduce concat)
    2. 위 단계의 결과물을 filter로 결과값을 반환한다.

   제목, 작가, 플랫폼, 장르

  */

  @Get(`/search/:criteria`)
  public searchData(@Param('criteria') criteria: string) {
    criteria = criteria.replace(/\s/gi, '');

    const fileList = fs.readdirSync(dataPath, 'utf-8');

    const data = fileList.reduce((prev, cur) => {
      return prev.concat(
        JSON.parse(
          fs.readFileSync(`${dataPath}/${cur}/${cur}_all.json`, 'utf8'),
        ),
      );
    }, []);

    const result = data.filter((val: IwebtoonDTO) => {
      return (
        val.title.replace(/\s/gi, '').includes(criteria) ||
        val.author.replace(/\s/gi, '').includes(criteria) ||
        val.genre.replace(/\s/gi, '').includes(criteria) ||
        val.platform === platformKorToEng[criteria] ||
        val.platform === criteria
      );
    });

    return result;
  }
}

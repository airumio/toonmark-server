import 'reflect-metadata';
import { Container } from 'typedi';
import fs from 'fs';
import Moment from 'moment';
import Axios, { AxiosResponse } from 'axios';
import {
  Controller,
  JsonController,
  Param,
  Body,
  Get,
  Post,
  Put,
  Delete,
} from 'routing-controllers';
import { BaseController } from './BaseController';
import { Platform, Weekday } from '../model/Enum';
import Config from '../config/config.json';
import Address from '../Address.json';
import {
  BaseService,
  NaverService,
  DaumService,
  IwebtoonDTO,
} from '../service';

const dataPath = __dirname + '\\..\\..\\src\\data';
const platformregex =
  '(naver)|(daum)|(kakao)|(lezin)|(toomics)|(toptoon)|(misterblue)';

@JsonController('/webtoon')
export class WebtoonController extends BaseController {
  private address: { [key: string]: string } = Address;

  serviceSelector = (platform: Platform): BaseService => {
    if (platform === Platform.NAVER) return Container.get(NaverService);
    else if (platform === Platform.DAUM) return Container.get(DaumService);
  };

  @Get('/test')
  test = async () => {
    return;
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
      // if (true) return true;

      return false;
    } catch (error) {
      console.error(error);
      return;
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

  dataIntegration(data: IwebtoonDTO[], platform: Platform) {
    try {
      const file = `${dataPath}/${platform}/${platform}_all.json`;

      if (!fs.existsSync(file)) {
        fs.appendFileSync(file, '[]');
      }

      const filedata: IwebtoonDTO[] = JSON.parse(fs.readFileSync(file, 'utf8'));

      const buf = JSON.stringify(
        this.getUniqueData(data.concat(filedata), 'title'),
      );

      fs.writeFileSync(file, buf, 'utf8');
    } catch (error) {
      console.error(error);
      return;
    }
  }

  @Get(`/:platform(${platformregex})`)
  public async getList(
    @Param('platform') platform: Platform,
  ): Promise<IwebtoonDTO[] | undefined> {
    try {
      const container = this.serviceSelector(Platform.NAVER);
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
    @Param('weekday') weekday: Weekday,
  ): Promise<IwebtoonDTO[] | undefined> {
    try {
      if (!Object.values(Weekday).includes(weekday)) {
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
}

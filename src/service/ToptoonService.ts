import 'reflect-metadata';
import { Service } from 'typedi';
import Axios from 'axios';
import { IwebtoonDTO } from './Webtoon';
import { Platform } from '../model/Enum';
import { platformDaytype, toptoonWeek, toptoonApiType } from '../model/Object';
import { BaseService } from './BaseService';
import Address from '../Address.json';

const address: { [key: string]: string } = Address;

@Service()
export class ToptoonService extends BaseService {
  public async createData(
    url: URL,
    adultFlag: 'adult' | 'non_adult' = 'non_adult',
  ): Promise<IwebtoonDTO[] | undefined | any> {
    try {
      const baseUrl = 'https://toptoon.com/';
      const response = await Axios.get(url.href);
      const rawdata = response.data[adultFlag];

      const data = rawdata.map((val: toptoonApiType) => {
        const id = val.id;
        const title = val.meta.title;
        const weekday = val.comicWeekly
          .filter((val) => val.comic_weekly < 10)
          .map((value) => Object.keys(toptoonWeek)[value.comic_weekly - 1])
          .join(',');
        const thumbnail =
          adultFlag === 'adult'
            ? val.thumbnail.portrait
            : val.thumbnailNonAdult.portrait;
        const link = baseUrl + val.meta.comicsListUrl;
        const author = val.meta.author.authorData
          .map((val) => val.name)
          .join(',');
        const isUp = val.ribbon.up;
        const isBreak = false;
        const genre = val.meta.genre.map((val) => val.name).join(',');

        const result: IwebtoonDTO = {
          id,
          title,
          weekday,
          thumbnail,
          link,
          author,
          isUp,
          isBreak,
          genre,
          platform: Platform.TOPTOON,
        };

        return result;
      });

      return data;
    } catch (error) {
      console.error(error);
      return;
    }
  }

  public async getInfo(weekday?: string): Promise<IwebtoonDTO[]> {
    try {
      if (weekday === undefined) {
        const data = await platformDaytype.toptoon.reduce(async (prev, cur) => {
          return (await prev).concat(
            await this.createData(new URL(address[`toptoon-${cur}`])),
          );
        }, Promise.resolve([]));

        return data;
      } else {
        const data = await this.createData(
          new URL(address[`toptoon-${weekday}`]),
        );

        return data;
      }
    } catch (error) {
      console.error(error);
    }
  }
}

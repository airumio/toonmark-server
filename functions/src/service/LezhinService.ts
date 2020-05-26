import 'reflect-metadata';
import { Service } from 'typedi';
import Axios from 'axios';
import { IwebtoonDTO } from './Webtoon';
import { Platform } from '../model/Enum';
import { lezhinApiType, lezhinGenreList, lezhinWeek } from '../model/Object';
import { BaseService } from './BaseService';
import Address from '../Address.json';

@Service()
export class LezhinService extends BaseService {
  getSortedData(
    baseurl: string,
    rawdata: lezhinApiType,
    genreList: lezhinGenreList,
  ): IwebtoonDTO {
    const id = rawdata.targetUrl.split('/')[3];
    const title = rawdata.title;
    const weekday = rawdata.schedule.periods.join(',').toLowerCase();
    const thumbnail =
      Address['lezhin-thumb'] +
      rawdata.mediaList[rawdata.mediaList.length - 1].url;
    const link = baseurl + rawdata.targetUrl;
    const author = rawdata.authors.map((val) => val.name).join(',');
    const isUp = rawdata.badges.includes('u');
    const isBreak = rawdata.badges.includes('x');
    const genre = genreList.find((el) => el.id === rawdata.genres.toString())
      .name;

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
      platform: Platform.LEZHIN,
    };

    return result;
  }

  public async createData(
    url: URL,
    adultFlag: boolean = false,
  ): Promise<IwebtoonDTO[]> {
    try {
      const weekday = url.searchParams.get('param');
      const response = await Axios.get(url.href, {
        headers: {
          'x-lz-locale': 'ko-KR',
          'x-lz-allowadult': adultFlag,
          'x-lz-adult': '2',
        },
      });
      const genreList = response.data.data.extra.genreList;
      const rawdata: [{ items: [lezhinApiType] }] =
        response.data.data.inventoryList;
      rawdata.splice(0, 1);

      if (weekday === 'undefined') {
        const data = rawdata.reduce((prev: any[], cur) => {
          return prev.concat(
            cur.items.map((val) =>
              this.getSortedData(url.origin, val, genreList),
            ),
          );
        }, []);

        return data;
      } else {
        const data = rawdata[Number(weekday)].items.map((val) =>
          this.getSortedData(url.origin, val, genreList),
        );

        return data;
      }
    } catch (error) {
      console.error(error);
    }
  }

  public async getInfo(weekday?: string): Promise<IwebtoonDTO[]> {
    try {
      const data = await this.createData(
        new URL(`${Address.lezhin}?param=${lezhinWeek[weekday]}`),
      );

      return data;
    } catch (error) {
      console.error(error);
    }
  }
}

import 'reflect-metadata';
import { Service } from 'typedi';
import Cheerio from 'cheerio';
import Axios, { AxiosResponse } from 'axios';
import { IwebtoonDTO } from './Webtoon';
import { Platform, Weekday } from '../model/Enum';
import { BaseService } from './BaseService';
import Address from '../Address.json';

type lezhinApi = {
  targetUrl: string;
  title: string;
  schedule: { periods: string[] };
  mediaList: [{ url: string }];
  authors: [{ name: string }];
  badges: string;
  genres: string[];
};
type lezhinGenreList = [{ id: string; name: string }];

const weekObj: { [key: string]: string } = {
  sun: '0',
  mon: '1',
  tue: '2',
  wed: '3',
  thu: '4',
  fri: '5',
  sat: '6',
  ten: '7',
};

@Service()
export class LezhinService extends BaseService {
  getSortedData(
    baseurl: string,
    rawdata: lezhinApi,
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
    const is_up = rawdata.badges.includes('u');
    const is_break = rawdata.badges.includes('x');
    const genre = genreList.find((el) => el.id === rawdata.genres.toString())
      .name;

    const result: IwebtoonDTO = {
      id,
      title,
      weekday,
      thumbnail,
      link,
      author,
      is_up,
      is_break,
      genre,
      platform: Platform.LEZHIN,
    };

    return result;
  }

  public async createData(url: URL): Promise<IwebtoonDTO[]> {
    try {
      const weekday = url.searchParams.get('param');
      const response = await Axios.get(url.href, {
        headers: {
          'x-lz-locale': 'ko-KR',
          'x-lz-allowadult': 'true',
          'x-lz-adult': '2',
        },
      });
      const genreList = response.data.data.extra.genreList;
      const rawdata: [{ items: [lezhinApi] }] =
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
        new URL(`${Address.lezhin}?param=${weekObj[weekday]}`),
      );

      return data;
    } catch (error) {
      console.error(error);
    }
  }
}

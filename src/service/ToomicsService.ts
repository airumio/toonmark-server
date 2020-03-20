import 'reflect-metadata';
import { Service } from 'typedi';
import Cheerio from 'cheerio';
import Axios, { AxiosInstance } from 'axios';
import rateLimit from 'axios-rate-limit';
import { IwebtoonDTO } from './Webtoon';
import { Platform, Weekday } from '../model/Enum';
import { platform_daytype, toomics_week } from '../model/Object';
import { BaseService } from './BaseService';
import Address from '../Address.json';

@Service()
export class ToomicsService extends BaseService {
  getExtraData = async (
    axios: AxiosInstance,
    link: string,
  ): Promise<string[] | undefined> => {
    try {
      const response = await axios.get(link, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
        },
      });

      const $ = Cheerio.load(response.data);

      const weekday = $('.tab-bar .active span')
        .contents()
        .toArray()
        .map((val) => {
          return Weekday[val.data];
        })
        .join(',');
      const author = $('.episode__author dd')
        .text()
        .split('/')
        .join(',');

      return [weekday, author];
    } catch (error) {
      // console.error(error);
      console.log(link);
      return ['error', 'error'];
    }
  };

  public async createData(url: URL): Promise<IwebtoonDTO[] | undefined | any> {
    try {
      async function fetchRawData(
        pageNum: number,
        data: string,
      ): Promise<string> {
        const resData = await Axios.post(
          url.href,
          `page=${pageNum}&load_contents=Y`,
          {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
            },
          },
        );

        if (resData.data !== 0)
          return fetchRawData(++pageNum, data + resData.data);

        return data;
      }

      const rawdata: string = await fetchRawData(1, '');

      const $ = Cheerio.load(rawdata);

      const axios = rateLimit(Axios.create(), {
        maxRequests: 2,
        perMilliseconds: 400,
      });

      const data = Promise.all(
        $('.grid__li')
          .toArray()
          .map(async (val, idx) => {
            const el = Cheerio.load(val);
            const title = el('.toon-dcard__title').text();
            const link = url.origin + el('a').attr().href;
            const id = link.split('/')[link.split('/').length - 1];
            const thumbnail = el('img').attr()['data-original'];
            const is_up: boolean =
              $('.sp-icon__l-up').length > 0 ? true : false;
            const is_break: boolean = false;
            const genre = el('.toon-dcard__link')
              .text()
              .split('/')
              .join(',');

            const [weekday, author] = await this.getExtraData(axios, link);

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
              platform: Platform.TOOMICS,
            };

            return result;
          }),
      );

      return data;
    } catch (error) {
      console.error(error);
      return;
    }
  }

  public async getInfo(weekday?: string): Promise<IwebtoonDTO[]> {
    try {
      if (weekday === undefined) {
        const data = await platform_daytype.toomics.reduce(
          async (prev, cur) => {
            return (await prev).concat(
              await this.createData(
                new URL(Address.toomics + toomics_week[cur]),
              ),
            );
          },
          Promise.resolve([]),
        );

        return data;
      } else {
        const data = await this.createData(
          new URL(Address.toomics + toomics_week[weekday]),
        );

        return data;
      }
    } catch (error) {
      console.error(error);
    }
  }
}

import 'reflect-metadata';
import { Service } from 'typedi';
import Cheerio from 'cheerio';
import Axios, { AxiosResponse } from 'axios';
import { IwebtoonDTO } from './Webtoon';
import { Platform, Weekday } from '../model/Enum';
import { BaseService } from './BaseService';
import Address from '../Address.json';

@Service()
export class NaverService extends BaseService {
  private address: { [key: string]: string } = Address;

  // constructor() {
  //   super();
  //   this.createData = this.createData.bind(this);
  //   this.getInfo = this.getInfo.bind(this);
  // }

  getExtraData = async (link: string): Promise<string[] | undefined> => {
    try {
      const response: AxiosResponse<any> = await Axios.get(
        link.replace('://', '://m.'),
      );

      const $ = Cheerio.load(response.data);
      const weekday = $('.week_day dd ul:nth-of-type(1) li')
        .text()
        .split('')
        .map((val: string | number) => Weekday[val])
        .join(',');
      const genre: string = $('.genre dd span, .genre dd ul li')
        .contents()
        .toArray()
        .map((val) => val.data)
        .join(',');

      return [weekday, genre];
    } catch (error) {
      console.error(error);
      return;
    }
  };

  /*
    url : https://m.comic.naver.com/webtoon/weekday.nhn
    param : ?week=mon

    7번(일주일) foreach or map
     가져올 값
      1. title
      2. ID
      3. weekday
      4. thumbnail
      5. platform
      6. link
      7. is_up
      8. is_rest
      9. author
      10? favorite
      해당 링크 들어가서
        11. 장르


        
  
  */

  public async createData(url: string): Promise<IwebtoonDTO[] | undefined> {
    try {
      const baseUrl = new URL(url).origin.replace('m.', '');
      const response: AxiosResponse<any> = await Axios.get(url);

      const $ = Cheerio.load(response.data);

      const data = Promise.all(
        $('.list_toon .item .info .title')
          .contents()
          .toArray()
          .map(async (val) => {
            const title = val.data;
            const parentTag = $(
              `.list_toon .item .info .title:contains(${title})`,
            ).parents('a');
            const link = baseUrl + parentTag.attr().href;
            const linkParams = new URL(link);
            const id = linkParams.searchParams.get('titleId');
            // const weekday = linkParams.searchParams.get('week');
            const thumbnail = parentTag.find('.thumbnail img').attr().src;
            const author = parentTag.find('.info .author').text();
            const is_up: boolean =
              parentTag.find('.info .detail .up').length > 0 ? true : false;
            const is_break: boolean =
              parentTag.find('.info .detail .break').length > 0 ? true : false;

            const [weekday, genre] = await this.getExtraData(link);

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
              platform: Platform.NAVER,
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
        const week = [
          Weekday.MON,
          Weekday.TUE,
          Weekday.WED,
          Weekday.THU,
          Weekday.FRI,
          Weekday.SAT,
          Weekday.SUN,
        ];

        const data = await week.reduce(async (prev, cur) => {
          return (await prev).concat(
            await this.createData(Address.naver + '?week=' + cur),
          );
        }, Promise.resolve([]));

        return data;
      } else {
        const data = await this.createData(Address.naver + '?week=' + weekday);

        return data;
      }
    } catch (error) {
      console.error(error);
    }
  }
}

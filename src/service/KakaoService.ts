import 'reflect-metadata';
import { Service } from 'typedi';
import Cheerio from 'cheerio';
import Axios, { AxiosResponse } from 'axios';
import { IwebtoonDTO } from './Webtoon';
import { Platform, Genre, Weekday } from '../model/Enum';
import { BaseService } from './BaseService';
import Address from '../Address.json';
import Moment from 'moment';

type kakaoApi = {
  series_id: string;
  title: string;
  thumb_img: string;
  author: string;
  last_slide_added_date: string;
  sub_category_title: string;
};

const weekObj: { [key: string]: string } = {
  mon: '1',
  tue: '2',
  wed: '3',
  thu: '4',
  fri: '5',
  sat: '6',
  sun: '7',
};

@Service()
export class KakaoService extends BaseService {
  public async createData(url: string): Promise<IwebtoonDTO[]> {
    try {
      const baseUrl = 'https://page.kakao.com/';
      const response: AxiosResponse<any> = await Axios.get(url);

      const rawdata =
        response.data.section_containers[0].section_series[0].list;
      const data = rawdata.map((val: kakaoApi) => {
        const id = val.series_id;
        const title = val.title;
        const weekday = Object.keys(weekObj)[Number(url.slice(-1)) - 1];
        const thumbnail = Address['kakao-thumb'] + val.thumb_img;
        const link = `${baseUrl}home?seriesId=${id}`;
        const author = val.author;
        const lastestUpdate = val.last_slide_added_date;
        const yesterday = Moment()
          .subtract(1, 'day')
          .set({ hour: 22, minute: 0, second: 0 });
        const is_up = Moment(lastestUpdate).isBetween(yesterday, Moment());
        const is_break = false;
        const genre = val.sub_category_title.slice(0, -2);

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
          platform: Platform.KAKAO,
        };

        return result;
      });

      return data;
    } catch (error) {
      console.error(error);
    }
  }

  public async getInfo(weekday?: string): Promise<IwebtoonDTO[]> {
    try {
      const week = [
        Weekday.mon,
        Weekday.tue,
        Weekday.wed,
        Weekday.thu,
        Weekday.fri,
        Weekday.sat,
        Weekday.sun,
      ];

      if (weekday === undefined) {
        const data = await week.reduce(async (prev, cur) => {
          return (await prev).concat(
            await this.createData(Address.kakao + cur),
          );
        }, Promise.resolve([]));
        return data;
      } else {
        const data = await this.createData(Address.kakao + weekObj[weekday]);
        return data;
      }
    } catch (error) {
      console.error(error);
    }
  }
}

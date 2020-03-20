import 'reflect-metadata';
import { Service } from 'typedi';
import Axios, { AxiosResponse } from 'axios';
import { IwebtoonDTO } from './Webtoon';
import { Platform } from '../model/Enum';
import { kakao_API_type, platform_daytype, kakao_week } from '../model/Object';
import { BaseService } from './BaseService';
import Address from '../Address.json';
import Moment from 'moment';

@Service()
export class KakaoService extends BaseService {
  public async createData(url: URL): Promise<IwebtoonDTO[]> {
    try {
      const baseUrl = 'https://page.kakao.com/';
      const response: AxiosResponse<any> = await Axios.get(url.href);

      const rawdata =
        response.data.section_containers[0].section_series[0].list;
      const data = rawdata.map((val: kakao_API_type) => {
        const id = val.series_id;
        const title = val.title;
        const weekday = Object.keys(kakao_week)[
          Number(url.searchParams.get('day')) - 1
        ];
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
      if (weekday === undefined) {
        const data = await platform_daytype.kakao.reduce(async (prev, cur) => {
          return (await prev).concat(
            await this.createData(new URL(Address.kakao + kakao_week[cur])),
          );
        }, Promise.resolve([]));
        return data;
      } else {
        const data = await this.createData(
          new URL(Address.kakao + kakao_week[weekday]),
        );
        return data;
      }
    } catch (error) {
      console.error(error);
    }
  }
}

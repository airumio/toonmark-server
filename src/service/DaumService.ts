import 'reflect-metadata';
import { Service } from 'typedi';
import Cheerio from 'cheerio';
import Axios, { AxiosResponse } from 'axios';
import { IwebtoonDTO } from './Webtoon';
import { Platform, Weekday } from '../model/Enum';
import { BaseService } from './BaseService';
import Address from '../Address.json';
import Moment from 'moment';

type daumApi = {
  nickname: string;
  title: string;
  webtoonWeeks: [{ weekDay: string }];
  thumbnailImage2: { url: string };
  cartoon: { artists: [{ penName: string }]; genres: [{ name: string }] };
  latestWebtoonEpisode: { dateCreated: string };
  restYn: string;
};

@Service()
export class DaumService extends BaseService {
  public async createData(url: string): Promise<IwebtoonDTO[] | undefined> {
    try {
      const baseUrl = new URL(url).origin;
      const response: AxiosResponse<any> = await Axios.get(url);
      const rawdata = response.data.data;
      const data = rawdata.map((val: daumApi) => {
        const id = val.nickname;
        const title = val.title;
        const weekday = val.webtoonWeeks
          .map((value) => value.weekDay)
          .join(',');
        const thumbnail = val.thumbnailImage2.url;
        const link = `${baseUrl}/webtoon/view/${id}`;
        const author = val.cartoon.artists
          .reduce((prev, cur) => {
            if (!prev.includes(cur.penName)) return prev.concat(cur.penName);
            else return prev;
          }, [])
          .join('.');
        const lastestUpdate = val.latestWebtoonEpisode.dateCreated.slice(0, 8);
        const yesterday = Moment()
          .subtract(1, 'day')
          .set({ hour: 22, minute: 0, second: 0 });
        const is_up = Moment(lastestUpdate).isBetween(yesterday, Moment());
        const is_break = val.restYn === 'Y' ? true : false;
        const genre = val.cartoon.genres.map((val) => val.name).join(',');

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
          platform: Platform.DAUM,
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
          return (await prev).concat(await this.createData(Address.daum + cur));
        }, Promise.resolve([]));

        return data;
      } else {
        const data = await this.createData(Address.daum + weekday);

        return data;
      }
    } catch (error) {
      console.error(error);
    }
  }
}

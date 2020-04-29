import 'reflect-metadata';
import { Service } from 'typedi';
import Axios, { AxiosResponse } from 'axios';
import { IwebtoonDTO } from './Webtoon';
import { Platform } from '../model/Enum';
import { daumApiType, platformDaytype } from '../model/Object';
import { BaseService } from './BaseService';
import Address from '../Address.json';
import Moment from 'moment';

@Service()
export class DaumService extends BaseService {
  public async createData(url: URL): Promise<IwebtoonDTO[] | undefined> {
    try {
      const baseUrl = url.origin;
      const response: AxiosResponse<any> = await Axios.get(url.href);
      const rawdata = response.data.data;

      const data = rawdata.map((val: daumApiType) => {
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
        const isUp = Moment(lastestUpdate).isBetween(yesterday, Moment());
        const isBreak = val.restYn === 'Y' ? true : false;
        const genre = val.cartoon.genres.map((val) => val.name).join(',');

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
        const data = await platformDaytype.daum.reduce(async (prev, cur) => {
          return (await prev).concat(
            await this.createData(new URL(Address.daum + cur)),
          );
        }, Promise.resolve([]));

        return data;
      } else {
        const data = await this.createData(new URL(Address.daum + weekday));

        return data;
      }
    } catch (error) {
      console.error(error);
    }
  }
}

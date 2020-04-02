import 'reflect-metadata';
import { Service } from 'typedi';
import Axios, { AxiosResponse } from 'axios';
import Cheerio from 'cheerio';
import { IwebtoonDTO } from './Webtoon';
import { Platform } from '../model/Enum';
import { misterblueWeek } from '../model/Object';
import { BaseService } from './BaseService';
import Address from '../Address.json';

@Service()
export class MisterblueService extends BaseService {
  public async createData(
    el: CheerioElement,
    adultFlag: boolean = false,
  ): Promise<IwebtoonDTO[] | undefined> {
    try {
      const $ = Cheerio.load(el);

      const data = $('ul li')
        .toArray()
        .map((val) => {
          const tag = Cheerio.load(val);
          const isAdult = tag('.adult').length > 0 ? true : false;

          const id = tag('.tit a')
            .attr()
            .href.split('/')[2];
          const title = tag('.tit a').text();
          const weekday = $('span')
            .contents()
            .toArray()[0].data;
          const thumbnail = isAdult
            ? adultFlag === false
              ? 'https://www.mrblue.com/Asset/images/defaults/img_200X122_adult.jpg?ver=181010'
              : `https://img.mrblue.com/prod_img/comics/${id}/wide.jpg`
            : `https://img.mrblue.com/prod_img/comics/${id}/wide.jpg`;
          const link = `${Address.misterblue}/${id}`;
          const author = tag('.name > a')
            .contents()
            .toArray()
            .map((val) => val.data)
            .join(',');
          const isUp = tag('.label-up').length > 0 ? true : false;
          const isBreak = tag('.label-rest').length > 0 ? true : false;
          const genre = tag('.name span a').text();

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
            platform: Platform.MISTERBLUE,
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
      const response: AxiosResponse<any> = await Axios.get(Address.misterblue);
      const $ = Cheerio.load(response.data);

      if (weekday === undefined) {
        const data = await $('.serial-list > li')
          .toArray()
          .reduce(async (prev, cur) => {
            return (await prev).concat(await this.createData(cur));
          }, Promise.resolve([]));

        return data;
      } else {
        const data = this.createData(
          $('.serial-list > li').toArray()[misterblueWeek[weekday]],
        );

        return data;
      }
    } catch (error) {
      console.error(error);
    }
  }
}

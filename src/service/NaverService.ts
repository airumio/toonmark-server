import 'reflect-metadata';
import { Service } from 'typedi';
import Cheerio from 'cheerio';
import { AxiosResponse } from 'axios';
import { IwebtoonDTO } from './Webtoon';
import { Platform } from '../model/Enum';
import { BaseService } from './BaseService';
import Address from '../Address.json';

@Service()
export class NaverService extends BaseService {
  constructor() {
    super();
    this.createData = this.createData.bind(this);
    this.getWeekInfo = this.getWeekInfo.bind(this);
  }

  myObj = (title: string) => ({
    week: `.daily_all ul li a[title='${title}']`,
    day: `.daily_img ul li .thumb a[title='${title}']`,
  });

  //함수 인자로써 2개까지
  //3개까지 3개를 넘어가면 'Object화 해서 넘긴다'.

  private createData($: CheerioStatic, title: string, kind: 'week' | 'day') {
    const attribs = $(this.myObj(title)[kind]).attr();
    // const parentTag = $(`a[title='${title}']`).parent();
    const parentTag = $(this.myObj(title)[kind]).parent();
    const href = new URL(Address.naver + attribs.href);

    const link: string = href.origin + attribs.href;
    const id: string | number = href.searchParams.get('titleId');
    const weekday: string = href.searchParams.get('weekday');
    const thumbnail: string = parentTag.find('.thumb a img').attr()['src'];
    const is_up: boolean =
      parentTag.find('.thumb .ico_updt').length > 0 ? true : false;
    const is_rest: boolean =
      parentTag.find('.thumb .ico_break').length > 0 ? true : false;

    const rank: string | undefined =
      parentTag
        .siblings('dl')
        .find('.rating_type strong')
        .text() || undefined;
    const author: string | undefined =
      parentTag
        .siblings('dl')
        .find('.desc a')
        .text() || undefined;

    // ?? 연산자는 undefined, null 만 null operator??
    // || "", undefined, null

    const result: IwebtoonDTO = {
      id,
      title,
      weekday,
      thumbnail,
      link,
      is_up,
      is_rest,
      rank,
      author,
      platform: Platform.NAVER,
    };
    return result;
  }

  public getWeekInfo(response: AxiosResponse<any>): IwebtoonDTO[] {
    const cheerioStatic = Cheerio.load(response.data);

    // 웹툰 제목들
    const titles: string[] = cheerioStatic(`.list_area ul li a[title]`)
      .contents()
      .toArray()
      .map((val) => val.data);

    const dataList: IwebtoonDTO[] = titles.reduce(
      (prev, cur) => prev.concat(this.createData(cheerioStatic, cur, 'week')),
      [],
    );

    // console.log(dataList);

    return dataList;
  }

  public getDayInfo(response: AxiosResponse<any>): IwebtoonDTO[] {
    const cheerioStatic = Cheerio.load(response.data);

    const titles: string[] = cheerioStatic(`.list_area ul li .thumb a`)
      .toArray()
      .map((val) => val.attribs['title']);

    const dataList: IwebtoonDTO[] = titles.reduce(
      (prev, cur) => prev.concat(this.createData(cheerioStatic, cur, 'day')),
      [],
    );

    return dataList;
  }
}

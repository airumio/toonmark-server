import 'reflect-metadata';
import { Service } from 'typedi';
import Cheerio from 'cheerio';
import Axios, { AxiosResponse } from 'axios';
import { IwebtoonDTO } from './Webtoon';
import { Platform, Genre } from '../model/Enum';
import { BaseService } from './BaseService';
import Address from '../Address.json';
import { URLSearchParams } from 'url';
import { promises } from 'dns';

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

  weekdayChecker = (arg: Cheerio) => {
    if (arg.length > 1) {
      return arg
        .toArray()
        .map((val) => val.attribs.href.slice(-3))
        .toString();
    } else {
      return arg.attr().href.slice(-3);
    }
  };

  getExtraData = async (link: string): Promise<string | undefined> => {
    try {
      const response: AxiosResponse<any> = await Axios.get(link).then(
        (response) => response,
      );

      const $ = Cheerio.load(response.data);
      const genre: string = $('.genre').text();

      return genre;
    } catch (error) {
      // console.warn(error);
      // console.log(link);
      return;
    }
  };

  //함수 인자로써 2개까지
  //3개까지 3개를 넘어가면 'Object화 해서 넘긴다'.

  public async createData(
    $: CheerioStatic,
    title: string,
    kind: 'week' | 'day',
  ): Promise<IwebtoonDTO> {
    const attribs = $(this.myObj(title)[kind]).attr();
    const parentTag = $(this.myObj(title)[kind]).parent();
    const href = new URL(Address.naver + attribs.href);

    const id: string | number = href.searchParams.get('titleId');
    const weekday: string = this.weekdayChecker($(this.myObj(title)[kind]));
    const thumbnail: string = parentTag.find('.thumb a img').attr()['src'];
    const link: string = href.origin + attribs.href;
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

    const genre = await this.getExtraData(link);

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
      genre,
    };

    return result;
  }

  public async getWeekInfo(
    response: AxiosResponse<any>,
  ): Promise<IwebtoonDTO[]> {
    const cheerioStatic = Cheerio.load(response.data);

    // 웹툰 제목들
    const titles: string[] = cheerioStatic(`.list_area ul li a[title]`)
      .contents()
      .toArray()
      .map((val) => val.data);

    const dataList = await Promise.all(
      titles.map((val) => this.createData(cheerioStatic, val, 'week')),
    );

    // const dataList = titles.reduce(async (prev, cur) => {
    //   return (await prev.then()).concat(
    //     await this.createData(cheerioStatic, cur, 'week'),
    //   );
    // }, Promise.resolve([]));

    return dataList;
  }

  public async getDayInfo(
    response: AxiosResponse<any>,
  ): Promise<IwebtoonDTO[]> {
    const cheerioStatic = Cheerio.load(response.data);

    const titles: string[] = cheerioStatic(`.list_area ul li .thumb a`)
      .toArray()
      .map((val) => val.attribs['title']);

    const dataList: IwebtoonDTO[] = titles.reduce(
      (prev, cur) =>
        prev.concat(
          this.createData(cheerioStatic, cur, 'day').then((val) => val),
        ),
      [],
    );

    return dataList;
  }
}

import 'reflect-metadata';
import { Service } from 'typedi';
import Cheerio from 'cheerio';
import { AxiosResponse } from 'axios';
import { IwebtoonDTO } from './Webtoon';
import { Platform } from '../model/Enum';
import { BaseService } from './BaseService';

@Service()
export class DaumService extends BaseService {
  public createData(
    $: CheerioStatic,
    title: string,
    kind: 'week' | 'day',
  ): IwebtoonDTO {
    throw new Error('Method not implemented.');
  }
  public async getWeekInfo(
    response: AxiosResponse<any>,
  ): Promise<IwebtoonDTO[]> {
    return null;
  }

  public async getDayInfo(
    response: AxiosResponse<any>,
  ): Promise<IwebtoonDTO[]> {
    return null;
  }
}

import 'reflect-metadata';
import { Service } from 'typedi';
import Cheerio from 'cheerio';
import { AxiosResponse } from 'axios';
import { IwebtoonDTO } from './Webtoon';
import { Platform } from '../model/Enum';
import { BaseService } from './BaseService';

@Service()
export class DaumService extends BaseService {
  public getWeekInfo(response: AxiosResponse<any>): IwebtoonDTO[] {
    return null;
  }

  public getDayInfo() {}
}

import 'reflect-metadata';
import { Container } from 'typedi';
import Cheerio from 'cheerio';
import fs from 'fs';
import Axios, { AxiosResponse } from 'axios';
import {
  Controller,
  JsonController,
  Param,
  Body,
  Get,
  Post,
  Put,
  Delete,
} from 'routing-controllers';
import { BaseController } from './BaseController';
import { Platform, Weekday } from '../model/Enum';
import Address from '../Address.json';
import {
  BaseService,
  NaverService,
  DaumService,
  IwebtoonDTO,
} from '../service';
import { platform } from 'os';

@JsonController('/webtoon')
export class WebtoonController extends BaseController {
  private address: { [key: string]: string } = Address;

  serviceSelector = (platform: string): BaseService => {
    if (platform === Platform.NAVER) return Container.get(NaverService);
    else if (platform === Platform.DAUM) return Container.get(DaumService);
  };

  @Get('/test')
  dataFileChecker = () => {
    fs.exists('../data/data.json', (exists) => {
      if (!exists) {
        fs.appendFile('../data/data.json', 'test file', (err) => {
          if (err) {
            console.log(err);
          }
          console.log('file make success');
        });
      }
    });
  };

  @Get('/:platform')
  public async getList(
    @Param('platform') platform: Platform,
  ): Promise<IwebtoonDTO[] | undefined> {
    try {
      const response: AxiosResponse<any> = await Axios.get(
        this.address[platform] + '/weekday.nhn',
      ).then((response) => response);

      //DI
      const container = this.serviceSelector(platform);

      const data = container.getWeekInfo(response);

      return data;
    } catch (error) {
      return;
    }
  }

  @Get('/:platform/:day')
  public async getDailyList(
    @Param('platform') platform: Platform,
    @Param('day') day: string,
  ): Promise<IwebtoonDTO[] | undefined> {
    try {
      const response: AxiosResponse<any> = await Axios.get(
        this.address[platform] + '/weekdayList.nhn?week=' + day,
      ).then((response) => response);

      //DI
      const container = this.serviceSelector(platform);

      const data = container.getDayInfo(response).then((val) => val);

      return data;
    } catch (error) {
      return;
    }
  }
}

// Object.assign(복사받을놈?? 원본??, 복사할럼) = > 두개를 합쳐서 새로운 object 탄생
// { key1 : hi }, {key2: hello} => {key1: hi, key2: hello}
// { key1: hi, key2: hello}, {key2: world} => {key1: hi, key2: world}
/*
      {
        ...obj1,
        key2: hello
      }


      const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const sum = numbers.reduce((prev, cur, idx, array) => prev + cur, 0); //55
      const div = numbers.reduce((prev, cur, idx, array) => prev * cur, 0); //?

      map, foreach, filter, reduce 공통점? array를 '순회' 한다.
      [0, ... array.lenvth]
      
      const newArr : newValue[] = somearray.map(function (value, index) {
        // return값이 '새로운 Array의 값'
        return newValue 
      });

      const newArr : newValue[] = somearray.filter(function (value, index){
        // return 값이 '조건'
        return index !== 0 
      });

      const red : someAwesomeValue = somearray.reduce(function (previous, current, index, array) {
        // 1번째 인자에 저따위인 callback이 들어가고, 2번째 인자에 initValue가 들어감
        얘도 마찬가지로 '순회'
      // index === 0 ?  previous === initValue, current === array[0], array === somearray
      return을 내맘대로 정해서 냠냠 하면 
      // index === 1 ? previous === 방금 0에서 반환한 값, current === array[1], array === somearray
      // index === 2 ? previous === 방금 \10에서 반환한 값, current === array[2], array === somearray ....
      // 마지막 까지 돌고 난 뒤 return 값이 반환
      }, initializedValue)
      
      */

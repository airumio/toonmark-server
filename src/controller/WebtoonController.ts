import 'reflect-metadata';
import { Container } from 'typedi';
import Cheerio from 'cheerio';
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
import { NaverService, DaumService, IwebtoonDTO } from '../service';
import { platform } from 'os';

@JsonController('/webtoon')
export class WebtoonController extends BaseController {
  // 플랫폼에 대한 url 요청
  private address: { [key: string]: string } = Address;
  /*

  플랫폼의 전체 리스트() {  //초기화시 자동 실행
    
    foreach(x : Weekday) {
      요일 목록가져오기(x);
    }
  }

  요일 리스트() {
    foreach(x : Weekday) {
      웹툰정보 가져오기(x);
    }
  }

  @Get('/:p/:t')
  웹툰 정보(p : Platform, t : Title) {

  }

const d = [{}, {}].filter(obj => obj.weekday === 'mon'); // 요일로 필터

*/
  @Get('/:platform')
  public async getList(
    @Param('platform') platform: string,
  ): Promise<IwebtoonDTO[] | undefined> {
    try {
      const response: AxiosResponse<any> = await Axios.get(
        this.address[platform] + '/weekday.nhn',
      ).then((response) => response);

      //DI
      let container;

      if (platform === Platform.NAVER) {
        container = Container.get(NaverService);
      } else if (platform === Platform.DAUM) {
        container = Container.get(DaumService);
      }

      const data = container.getWeekInfo(response);

      return data;
    } catch (error) {
      return;
    }
  }

  @Get('/:platform/:day')
  public async getDailyList(
    @Param('platform') platform: string,
    @Param('day') day: string,
  ): Promise<IwebtoonDTO[] | undefined> {
    try {
      const response: AxiosResponse<any> = await Axios.get(
        this.address[platform] + '/weekdayList.nhn?week=' + day,
      ).then((response) => response);

      //DI
      let container;

      if (platform === Platform.NAVER) {
        container = Container.get(NaverService);
      } else if (platform === Platform.DAUM) {
        container = Container.get(DaumService);
      }

      const data = container.getDayInfo(response);

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

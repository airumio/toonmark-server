import { AxiosResponse } from 'axios';
import { IwebtoonDTO } from './Webtoon';

// interface IBaseService<T extends IwebtoonDTO> {
//   createData: ($: CheerioStatic, title: string, kind: 'week' | 'day') => T;
//   getWeekInfo: (response: AxiosResponse<any>) => T[];
//   getDayInfo: (response: AxiosResponse<any>) => T[];
// }

export abstract class BaseService {
  // public abstract createData(
  //   $: CheerioStatic,
  //   title: string,
  //   kind: 'week' | 'day',
  // ): IwebtoonDTO;
  // public abstract getWeekInfo(response: AxiosResponse<any>): IwebtoonDTO[];
  // public abstract getDayInfo(response: AxiosResponse<any>): IwebtoonDTO[];

  public abstract async getInfo(weekday?: string): Promise<IwebtoonDTO[]>;
}

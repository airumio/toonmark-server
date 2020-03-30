import { IwebtoonDTO } from './Webtoon';

// interface IBaseService<T extends IwebtoonDTO> {
//   createData: ($: CheerioStatic, title: string, kind: 'week' | 'day') => T;
//   getWeekInfo: (response: AxiosResponse<any>) => T[];
//   getDayInfo: (response: AxiosResponse<any>) => T[];
// }

export abstract class BaseService {
  public abstract async createData(
    arg?: URL | CheerioElement,
  ): Promise<IwebtoonDTO[] | undefined>;

  public abstract async getInfo(weekday?: string): Promise<IwebtoonDTO[]>;
}

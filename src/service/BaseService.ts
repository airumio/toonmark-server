import { AxiosResponse } from 'axios';

export abstract class BaseService {
  getWeekInfo(response: AxiosResponse<any>) {}

  getDayInfo(response: AxiosResponse<any>) {}
}

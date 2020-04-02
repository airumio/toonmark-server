import { Interceptor, InterceptorInterface, Action } from 'routing-controllers';
import { IwebtoonDTO } from '../service';

const STATUS_CODE = {
  OK: 200,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  TIMEOUT: 408,
  CONFLICT: 409,
  ERROR: 500,
};

type status = {
  statusCode: number;
  statusMessage: string;
};

@Interceptor()
export class TestInterceptor implements InterceptorInterface {
  getStatusCode(content: any): status {
    if (content === undefined)
      return {
        statusCode: STATUS_CODE.NO_CONTENT,
        statusMessage: 'NO CONTENTS',
      };
    else return { statusCode: STATUS_CODE.OK, statusMessage: 'OK' };
  }

  intercept(action: Action, content: any) {
    const result = {
      status: this.getStatusCode(content),
      data: content,
    };
    action.response.statusCode = result.status.statusCode;

    return result;
  }
}

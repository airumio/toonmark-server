import { Middleware, ExpressMiddlewareInterface } from 'routing-controllers';
import { logger } from '../config/loggerConfig';

@Middleware({ type: 'before' })
export class LoggingMiddleware implements ExpressMiddlewareInterface {
  use(request: any, response: any, next: (err?: any) => any) {
    // console.log('[Log]');
    // logger.info('');
    next();
  }
}

import { Middleware, ExpressMiddlewareInterface } from 'routing-controllers';

@Middleware({ type: 'before' })
export class LoggingMiddleware implements ExpressMiddlewareInterface {
  use(request: any, response: any, next: (err?: any) => any) {
    console.log('[Log]]');
    next();
  }
}

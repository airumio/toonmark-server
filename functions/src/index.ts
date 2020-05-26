import * as functions from 'firebase-functions';

import 'reflect-metadata';
import { createExpressServer, useContainer } from 'routing-controllers';
import { Container } from 'typedi';
import { WebtoonController } from './controller/WebtoonController';
// import { LoggingMiddleware } from './middleware/LoggingMiddleware';
// import { TestInterceptor } from './interceptor/TestInterceptor';
// import fs from 'fs';
// import spdy from 'spdy';
// import path from 'path';
// import { config } from './config/config';
// import { logger } from '../config/loggerConfig';

// create routing-controllers
useContainer(Container);

// create controller
const app = createExpressServer({
  controllers: [WebtoonController],
  //   middlewares: [LoggingMiddleware],
  //   interceptors: [TestInterceptor],
});

export const api = functions.region('asia-east2').https.onRequest(app);

// Google functions provided https
// https server
// if (config.certPath ?? config.privateKey ?? config.certificate ?? false) {
//   const cert = {
//     key: fs.readFileSync(path.join(config.certPath, config.privateKey), 'utf8'),
//     cert: fs.readFileSync(
//       path.join(config.certPath, config.certificate),
//       'utf8',
//     ),
//     passphrase: config.passphrase,
//   };
//   const https = spdy.createServer(cert, app);
//   https.listen(config.httpsPort, () => {
//     console.log('https server on~');
//   });
// }

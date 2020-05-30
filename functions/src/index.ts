import * as functions from 'firebase-functions';

import 'reflect-metadata';
import { createExpressServer, useContainer } from 'routing-controllers';
import { Container } from 'typedi';
import { WebtoonController } from './controller/WebtoonController';
import axios from 'axios';
import { platformDaytype } from './model/Object';

// create routing-controllers
useContainer(Container);

// create controller
const app = createExpressServer({
  controllers: [WebtoonController],
  //   middlewares: [LoggingMiddleware],
  //   interceptors: [TestInterceptor],
});

export const api = functions.region('asia-east2').https.onRequest(app);

export const scheduledFunction1 = functions
  .region('asia-east2')
  .pubsub.schedule('1 */2 * * *')
  .onRun(async (context) => {
    refresh(platform1);

    return null;
  });

export const scheduledFunction2 = functions
  .region('asia-east2')
  .pubsub.schedule('6 */2 * * *')
  .onRun(async (context) => {
    refresh(platform2);

    return null;
  });

export const scheduledFunction3 = functions
  .region('asia-east2')
  .pubsub.schedule('11 */2 * * *')
  .onRun(async (context) => {
    refresh(platform3);

    return null;
  });

const platform1: string[] = ['naver', 'daum'];
const platform2: string[] = ['kakao', 'lezhin'];
const platform3: string[] = ['toomics', 'toptoon', 'misterblue'];

const refresh = (platform: string[]) => {
  platform.map(async (e: keyof typeof platformDaytype) => {
    platformDaytype[e].map(async (value) => {
      console.log(
        `Request url : https://asia-east2-toonmark-api.cloudfunctions.net/api/webtoon/${e}/${value}`,
      );
      axios
        .get(
          `https://asia-east2-toonmark-api.cloudfunctions.net/api/webtoon/${e}/${value}`,
        )
        .then((value) => {
          console.log(`${value.status} : ${value.statusText}`);
        })
        .catch((error) => {
          if (error.response) {
            console.log('ERROR : ', error.response);
          }
        });
    });
  });
};

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

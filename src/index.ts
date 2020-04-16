import 'reflect-metadata';
import {
  createExpressServer,
  useContainer,
  useExpressServer,
} from 'routing-controllers';
import { Container } from 'typedi';
import { WebtoonController } from './controller/WebtoonController';
import { LoggingMiddleware } from './middleware/LoggingMiddleware';
import { TestInterceptor } from './interceptor/TestInterceptor';
import fs from 'fs';
import spdy from 'spdy';

const certPath = `${__dirname}\\..\\.well-known\\validation`;

useContainer(Container);

const cert = {
  key: fs.readFileSync(`${certPath}\\private.key`, 'utf8'),
  cert: fs.readFileSync(`${certPath}\\self-signed.crt`, 'utf8'),
  passphrase: 'campantan',
};

const app = createExpressServer({
  controllers: [WebtoonController],
  middlewares: [LoggingMiddleware],
  interceptors: [TestInterceptor],
});

const app2 = spdy.createServer(cert, app);

app.listen(80, () => {
  console.log('server on~');
});

app2.listen(443, () => {
  console.log('https server on~');
});

// import express, { Request, Response } from 'express';
// import Cheerio, { FetchResult } from 'cheerio-httpcli';
// import Sample from './Sample';

// const app = express();
// const url: string = 'https://comic.naver.com/webtoon/weekday.nhn';
// const param = {};

// app.get('/crawling', (req: Request, res: Response) => {
//   Cheerio.fetch(url, param)
//     .then((result) => {
//       res.send(result.body);
//       // result.$("a").each(() => console.log(this.Text));
//       result.$('a').each((idx, el) => {
//         console.log(el.attribs.href);
//       });
//     })
//     .catch((err) => {
//       res.send(err);
//     });
// });

// app.get('/webtoon/:platform', (req: Request, res: Response) => {
//   console.log(req.params);
//   console.log(req.query.weekday);
//   Sample(req, res);
//   console.log('!!');
// });

// app.listen(8080, () => {
//   console.log('server on');
// });

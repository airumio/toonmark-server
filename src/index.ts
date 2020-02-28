import express, { Request, Response } from 'express';
import Cheerio, { FetchResult } from 'cheerio-httpcli';
import Sample from './Sample';

const app = express();
const url: string = 'https://comic.naver.com/webtoon/weekday.nhn';
const param = {};

app.get('/crawling', (req: Request, res: Response) => {
  Cheerio.fetch(url, param)
    .then((result) => {
      res.send(result.body);
      // result.$("a").each(() => console.log(this.Text));
      result.$('a').each((idx, el) => {
        console.log(el.attribs.href);
      });
    })
    .catch((err) => {
      res.send(err);
    });
});

app.get('/webtoon/:platform', (req: Request, res: Response) => {
  console.log(req.params);
  console.log(req.query.weekday);
  Sample(req, res);
  console.log('!!');
});

app.listen(8080, () => {
  console.log('server on');
});

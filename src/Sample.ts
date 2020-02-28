import express, { Request, Response } from 'express';
import Cheerio, { FetchResult } from 'cheerio-httpcli';

//const cheerio = require("cheerio-httpcli");

function sample(req: Request, res: Response) {
  const url =
    'https://comic.naver.com/webtoon/detail.nhn?titleId=650305&no=250&weekday=sat';
  const param = {};

  Cheerio.fetch(url, param)
    .then((result) => {
      // res.send(result.body);
      res.redirect(url);
      // result.$("a").each(() => console.log(this.Text));
      // result.$("a").each((idx, el) => {console.log(el.attribs.href)});
    })
    .catch((err) => {
      res.send(err);
    });
}

export default sample;

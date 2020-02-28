"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio_httpcli_1 = __importDefault(require("cheerio-httpcli"));
//const cheerio = require("cheerio-httpcli");
function sample(req, res) {
    const url = "https://comic.naver.com/webtoon/detail.nhn?titleId=650305&no=250&weekday=sat";
    const param = {};
    cheerio_httpcli_1.default.fetch(url, param).then(result => {
        // res.send(result.body);
        res.redirect(url);
        // result.$("a").each(() => console.log(this.Text));
        // result.$("a").each((idx, el) => {console.log(el.attribs.href)});
    }).catch(err => { res.send(err); });
}
;
exports.default = sample;
//# sourceMappingURL=Sample.js.map
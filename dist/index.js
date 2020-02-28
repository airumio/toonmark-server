"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cheerio_httpcli_1 = __importDefault(require("cheerio-httpcli"));
const Sample_1 = __importDefault(require("./Sample"));
const app = express_1.default();
const url = "https://comic.naver.com/webtoon/weekday.nhn";
const param = {};
app.get("/crawling", (req, res) => {
    cheerio_httpcli_1.default.fetch(url, param).then(result => {
        res.send(result.body);
        // result.$("a").each(() => console.log(this.Text));
        result.$("a").each((idx, el) => { console.log(el.attribs.href); });
    }).catch(err => { res.send(err); });
});
app.get("/webtoon/:platform", (req, res) => {
    console.log(req.params);
    console.log(req.query.weekday);
    Sample_1.default(req, res);
    console.log("!!");
});
app.listen(8080, () => {
    console.log("server on");
});
//# sourceMappingURL=index.js.map
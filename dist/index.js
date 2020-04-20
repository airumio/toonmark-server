"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const routing_controllers_1 = require("routing-controllers");
const typedi_1 = require("typedi");
const WebtoonController_1 = require("./controller/WebtoonController");
const LoggingMiddleware_1 = require("./middleware/LoggingMiddleware");
const TestInterceptor_1 = require("./interceptor/TestInterceptor");
const fs_1 = __importDefault(require("fs"));
const spdy_1 = __importDefault(require("spdy"));
const certPath = `${__dirname}\\..\\.well-known\\validation`;
routing_controllers_1.useContainer(typedi_1.Container);
const cert = {
    key: fs_1.default.readFileSync(`${certPath}\\private.key`, 'utf8'),
    cert: fs_1.default.readFileSync(`${certPath}\\self-signed.crt`, 'utf8'),
    passphrase: 'campantan',
};
const app = routing_controllers_1.createExpressServer({
    controllers: [WebtoonController_1.WebtoonController],
    middlewares: [LoggingMiddleware_1.LoggingMiddleware],
    interceptors: [TestInterceptor_1.TestInterceptor],
});
const app2 = spdy_1.default.createServer(cert, app);
app.listen(80, () => {
    console.log('server on~');
});
app2.listen(443, () => {
    console.log('https server on~');
});
//# sourceMappingURL=index.js.map
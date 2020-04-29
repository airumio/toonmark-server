"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const routing_controllers_1 = require("routing-controllers");
const typedi_1 = require("typedi");
const WebtoonController_1 = require("./controller/WebtoonController");
const LoggingMiddleware_1 = require("./middleware/LoggingMiddleware");
const TestInterceptor_1 = require("./interceptor/TestInterceptor");
const fs_1 = __importDefault(require("fs"));
const spdy_1 = __importDefault(require("spdy"));
const path_1 = __importDefault(require("path"));
const config_1 = require("./config/config");
const loggerConfig_1 = require("./config/loggerConfig");
// create routing-controllers
routing_controllers_1.useContainer(typedi_1.Container);
// http server
const app = routing_controllers_1.createExpressServer({
    controllers: [WebtoonController_1.WebtoonController],
    middlewares: [LoggingMiddleware_1.LoggingMiddleware],
    interceptors: [TestInterceptor_1.TestInterceptor],
});
app.listen(config_1.config.httpPort, () => {
    // console.log('server on~');
    loggerConfig_1.logger.info(`http server on port : ${config_1.config.httpPort}`);
});
// https server
if ((_c = (_b = (_a = config_1.config.certPath) !== null && _a !== void 0 ? _a : config_1.config.privateKey) !== null && _b !== void 0 ? _b : config_1.config.certificate) !== null && _c !== void 0 ? _c : false) {
    const cert = {
        key: fs_1.default.readFileSync(path_1.default.join(config_1.config.certPath, config_1.config.privateKey), 'utf8'),
        cert: fs_1.default.readFileSync(path_1.default.join(config_1.config.certPath, config_1.config.certificate), 'utf8'),
        passphrase: config_1.config.passphrase,
    };
    const https = spdy_1.default.createServer(cert, app);
    https.listen(config_1.config.httpsPort, () => {
        console.log('https server on~');
    });
}
//# sourceMappingURL=index.js.map
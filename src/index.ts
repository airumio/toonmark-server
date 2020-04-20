import 'reflect-metadata';
import { createExpressServer, useContainer } from 'routing-controllers';
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

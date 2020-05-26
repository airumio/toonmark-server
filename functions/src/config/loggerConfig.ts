import winston from 'winston';
import { format } from 'winston';

const myFormat = format.printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`; // log 출력 포맷 정의
});

const options = {
  // log파일
  // file: {
  //   level: 'info',
  //   filename: `${appRoot}/logs/winston-test.log`, // 로그파일을 남길 경로
  //   handleExceptions: true,
  //   json: false,
  //   maxsize: 5242880, // 5MB
  //   maxFiles: 5,
  //   colorize: false,
  //   format: combine(
  //     label({ label: 'winston-test' }),
  //     timestamp(),
  //     myFormat    // log 출력 포맷
  //   )
  // },
  // 개발 시 console에 출력
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false, // 로그형태를 json으로도 뽑을 수 있다.
    colorize: true,
    format: format.combine(
      format.label({ label: 'nba_express' }),
      format.timestamp(),
      myFormat,
    ),
  },
};

export const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `combined.log`
    //
    new winston.transports.Console(options.console),
    // new winston.transports.File({ filename: 'combined.log' }),
    // new winston.transports.File({ filename: 'error.log', level: 'error' }),
  ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}

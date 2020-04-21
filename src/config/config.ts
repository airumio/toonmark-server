import path from 'path';
import dotenv from 'dotenv';

const rootpath = process.cwd();

if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: path.join(rootpath, '.env', '.production') });
} else if (process.env.NODE_ENV === 'develop') {
  dotenv.config({ path: path.join(rootpath, '.env', '.develop') });
} else {
  throw new Error('not supported environment');
}

export const config = {
  rootpath: rootpath,
  certPath:
    process.env.CERT_PATH === undefined
      ? undefined
      : path.join(rootpath, process.env.CERT_PATH),
  privateKey: process.env.PRIVATE_KEY || undefined,
  certificate: process.env.CERTIFICATE || undefined,
  passphrase: process.env.CERT_PASS || undefined,
  httpPort: process.env.HTTP_PORT || 80,
  httpsPort: process.env.HTTPS_PORT || 443,
  datapath: process.env.DATA_PATH || 'src/data',
  dataType: process.env.DATA_TYPE || '.json',
  oldDataHourLimit: process.env.DATA_TIME_LIMIT || 2,
};

import dotenv from 'dotenv';

if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env/.production' });
} else if (process.env.CUSTOM_ENV === 'develop') {
  dotenv.config({ path: '.env/.develop' });
} else {
  throw new Error('not supported environment~');
}

export const config = {
  dataPath: process.env.DATA_PATH || 'public_data',
  dataType: process.env.DATA_TYPE || '.json',
  oldDataHourLimit: process.env.DATA_TIME_LIMIT || 2,
  contentType: process.env.DATA_CONTENT_TYPE || 'application/json',
};

export const environment = process.env.NODE_ENV;
export const isDevEnv = environment === 'development';
export const isProdEnv = environment === 'production';

export default {
  isDevEnv,
  isProdEnv,
  environment
};
  
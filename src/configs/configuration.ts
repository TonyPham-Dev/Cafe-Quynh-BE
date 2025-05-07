import * as process from 'process';

export default () => ({
  app: {
    port: parseInt(process.env?.APP_PORT || '3030', 10),
  },
  authentication: {
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
    jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  },
  storages: {
    type: process.env.STORAGE_TYPE,
    endPoint: process.env.S3_ENDPOINT,
    port: process.env.STORAGE_PORT,
    useSSL: process.env.STORAGE_USE_SSL,
    accessKey: process.env.STORAGE_ACCESS_KEY,
    secretKey: process.env.STORAGE_SECRET_KEY,
    bucketName: process.env.S3_BUCKET_NAME,
    region: process.env.STORAGE_REGION,
  },
  email: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
    accessKey: process.env.AWS_ACCESS_KEY,
    secretKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION,
  },
  gmo: {
    baseAuthUrl: process.env.GMO_BASE_AUTH_URL,
    baseUrl: process.env.GMO_BASE_URL,
    shopId: process.env.GMO_SHOP_ID,
    shopPass: process.env.GMO_SHOP_PASS,
    defaultPayerPhone: process.env.GMO_DEFAULT_PAYER_PHONE,
  },
  meta: {
    appId: process.env.META_APP_ID,
    appSecret: process.env.META_APP_SECRET,
    baseUrl: process.env.META_BASE_URL,
    accessToken: process.env.META_ACCESS_TOKEN,
  },
});

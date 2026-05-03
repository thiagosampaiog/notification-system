import { registerAs } from '@nestjs/config';

export default registerAs(
  'aws',
  (): Record<string, any> => ({
    accessKey: process.env.AWS_ACCESS_KEY,
    secretKey: process.env.AWS_SECRET_KEY,

    ses: {
      region: process.env.AWS_SES_REGION || 'us-east-1',
      sourceEmail: process.env.AWS_SES_SOURCE_EMAIL
    }
  })
);

import { getEnv } from './env.validation';
import { registerAs } from '@nestjs/config';

export default registerAs('sms', () => {
  const env = getEnv();
  return {
    account_sid: env.TWILIO_ACCOUNT_SID,
    auth_token: env.TWILIO_AUTH_TOKEN,
    service_sid: env.TWILIO_VERIFICATION_SERVICE_SID,
    sender_number: env.TWILIO_SENDER_PHONE_NUMBER
  };
});

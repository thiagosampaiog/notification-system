import { getEnv } from './env.validation';
import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => {
  const env = getEnv();

  return {
    secret: env.JWT_TOKEN_SECRET,
    refreshSecret: env.JWT_REFRESH_TOKKEN_SECRET,
    expiresIn: env.JWT_TOKEN_EXPIRESIN ?? 3600,
    refreshTokenExpiresIn: env.REFRESH_TOKEN_EXPIRESIN ?? 86400,
    issuer: env.JWT_TOKEN_ISSUER,
    audience: env.JWT_TOKEN_AUDIENCE
  };
});

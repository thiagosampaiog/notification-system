import { registerAs } from '@nestjs/config';
import { getEnv } from './env.validation';

const env = getEnv();

export default registerAs('authConfig', () => ({
  secret: env.JWT_TOKEN_SECRET,
  expiresIn: env.JWT_TOKEN_EXPIRESIN ?? 3600,
  refreshTokenExpiresIn: env.REFRESH_TOKEN_EXPIRESIN ?? 86400,
  issuer: env.JWT_TOKEN_ISSUER,
  audience: env.JWT_TOKEN_AUDIENCE,
}));

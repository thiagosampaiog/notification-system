import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class HashingProvider {
  abstract hashPassword(password: string | Buffer): Promise<string>;

  abstract comparePassword(
    plainPassword: string | Buffer,
    hashedPassword: string | Buffer
  ): Promise<boolean>;
}

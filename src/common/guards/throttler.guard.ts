import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const ip =
      request.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
      request.socket.remoteAddress ||
      '';

    return (
      request.hostname === 'localhost' || ip.startsWith('127.') || ip === '::1'
    );
  }
}

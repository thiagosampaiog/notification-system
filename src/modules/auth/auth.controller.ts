import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { AuthSignInDto } from './dto/auth-signIn.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CurrentUser } from '@app/common/decorators/current-user.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import type { AuthenticatedUser } from '@app/common/types/payload-user.type';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post
} from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signin(@Body() input: AuthSignInDto) {
    return this.authService.signIn(input);
  }

  @Public()
  @Post('register')
  async signup(@Body() input: CreateUserDto) {
    return this.authService.signUp(input);
  }

  @Public()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  public async refreshToken(@Body() input: RefreshTokenDto) {
    return this.authService.refreshToken(input);
  }

  @Get('me')
  async me(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.me(user);
  }
}

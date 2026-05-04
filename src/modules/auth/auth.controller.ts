import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { AuthSignInDto } from './dto/auth-signIn.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CurrentUser } from '@app/common/decorators/current-user.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import type { AuthenticatedUser } from '@app/common/types/payload-user.type';
import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @ApiOperation({ summary: 'Login and generate tokens' })
  @ApiBody({ type: AuthSignInDto })
  @ApiOkResponse({ description: 'Access and refresh tokens' })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signin(@Body() input: AuthSignInDto) {
    return this.authService.signIn(input);
  }

  @Public()
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiOkResponse({ description: 'Created user' })
  @Post('register')
  async signup(@Body() input: CreateUserDto) {
    return this.authService.signUp(input);
  }

  @Public()
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({ description: 'New access and refresh tokens' })
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  public async refreshToken(@Body() input: RefreshTokenDto) {
    return this.authService.refreshToken(input);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiOkResponse({ description: 'Authenticated user profile' })
  @Get('me')
  async me(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.me(user);
  }
}

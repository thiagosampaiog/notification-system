import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthSignInDto } from './dto/auth-signIn.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthenticatedUser } from '@app/common/types/payload-user.type';
import authConfig from '@app/infra/config/env/auth.config';
import { HashingProvider } from '@app/infra/hashing/hashing.provider';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    @Inject(authConfig.KEY)
    private readonly authConfiguration: ConfigType<typeof authConfig>,
    private readonly hashingProvider: HashingProvider,
    private readonly jwtService: JwtService
  ) {}

  async signUp(input: CreateUserDto) {
    return this.userService.create(input);
  }

  async signIn(input: AuthSignInDto) {
    const { email, password } = input;
    const user = await this.userService.findUserForLogin(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isValidPassword = await this.hashingProvider.comparePassword(
      password,
      user.password
    );

    if (!isValidPassword)
      throw new UnauthorizedException('Invalid credentials');

    return this.generateToken(user);
  }

  public async refreshToken(input: RefreshTokenDto) {
    try {
      const { sub } = await this.jwtService.verifyAsync(input.refreshToken, {
        secret: this.authConfiguration.secret,
        audience: this.authConfiguration.audience,
        issuer: this.authConfiguration.issuer
      });

      const user = await this.userService.findById(sub);

      return await this.generateToken(user);
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  async generateToken(user: User) {
    const { id, email, first_name, second_name, password, phone, role } = user;
    const payload = {
      email,
      firstName: first_name,
      secondName: second_name,
      phone,
      role
    };
    const accessToken = await this.signToken(
      id,
      this.authConfiguration.expiresIn,
      payload
    );
    const refreshToken = await this.signToken(
      id,
      this.authConfiguration.refreshTokenExpiresIn,
      payload
    );
    return {
      accessToken,
      refreshToken
    };
  }

  public async me(user: AuthenticatedUser) {
    return this.userService.findById(user.sub);
  }

  private async signToken<T>(userId: string, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        ...payload
      },
      {
        secret: this.authConfiguration.secret,
        issuer: this.authConfiguration.issuer,
        audience: this.authConfiguration.audience,
        expiresIn: expiresIn
      }
    );
  }
}

import { PartialType } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString, IsStrongPassword, IsUrl } from 'class-validator'

export class AuthSignInDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string

  @IsNotEmpty()
  @IsStrongPassword()
  password!: string

}

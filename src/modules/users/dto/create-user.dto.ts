import { PartialType } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString, IsStrongPassword, IsUrl } from 'class-validator'

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string

  @IsString()
  @IsNotEmpty()
  first_name!: string

  @IsString()
  @IsNotEmpty()
  second_name!: string

  @IsString()
  @IsPhoneNumber('BR')
  @IsNotEmpty()
  phone!: string

  @IsNotEmpty()
  @IsStrongPassword()
  password!: string

}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

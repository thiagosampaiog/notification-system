import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString, IsStrongPassword } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'Thiago' })
  @IsString()
  @IsNotEmpty()
  first_name!: string;

  @ApiProperty({ example: 'Sampaio' })
  @IsString()
  @IsNotEmpty()
  second_name!: string;

  @ApiProperty({ example: '+5511999999999' })
  @IsString()
  @IsPhoneNumber('BR')
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({ example: 'StrongPass#123' })
  @IsNotEmpty()
  @IsStrongPassword()
  password!: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

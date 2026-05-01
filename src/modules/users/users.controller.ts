import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post
} from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  async create(@Body() input: CreateUserDto) {
    return this.userService.create(input);
  }

  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') userId: string) {
    return this.userService.findById(userId);
  }

  @Patch(':id')
  async update(@Param('id') userId: string, @Body() input: UpdateUserDto) {
    return this.userService.update(input, userId);
  }

  @Delete(':id')
  async delete(@Param('id') userId: string) {
    return this.userService.delete(userId);
  }
}

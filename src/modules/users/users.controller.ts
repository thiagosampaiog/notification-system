import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags
} from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @ApiOperation({ summary: 'Create a user' })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({ description: 'User created successfully' })
  @Post()
  async create(@Body() input: CreateUserDto) {
    return this.userService.create(input);
  }

  @ApiOperation({ summary: 'List all users' })
  @ApiOkResponse({ description: 'List of users' })
  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  @ApiOperation({ summary: 'Get user by id' })
  @ApiOkResponse({ description: 'User found' })
  @Get(':id')
  async findById(@Param('id') userId: string) {
    return this.userService.findById(userId);
  }

  @ApiOperation({ summary: 'Update user by id' })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({ description: 'Updated user' })
  @Patch(':id')
  async update(@Param('id') userId: string, @Body() input: UpdateUserDto) {
    return this.userService.update(input, userId);
  }

  @ApiOperation({ summary: 'Delete user by id' })
  @ApiNoContentResponse({ description: 'User deleted' })
  @Delete(':id')
  async delete(@Param('id') userId: string) {
    return this.userService.delete(userId);
  }
}

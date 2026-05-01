import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { HashingProvider } from '@app/infra/hashing/hashing.provider';
import {
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private hashingProvider: HashingProvider
  ) {}

  private sanitize(user: User): Omit<User, 'password'> {
    const { password, ...rest } = user;
    return rest;
  }

  async create(input: CreateUserDto) {
    const exists = await this.userRepository.exists({
      where: [{ email: input.email }, { phone: input.phone }]
    });

    if (exists) throw new ConflictException('Phone or email is already in use');

    const user = this.userRepository.create({
      ...input,
      password: await this.hashingProvider.hashPassword(input.password)
    });

    const saved = await this.userRepository.save(user);

    return this.sanitize(saved);
  }

  public async findAll() {
    return this.userRepository.find({
      select: {
        id: true,
        email: true,
        first_name: true,
        second_name: true,
        phone: true,
        created_at: true,
        updated_at: true
      }
    });
  }

  async findById(userId: string): Promise<User> {
    const found = await this.userRepository.findOne({ where: { id: userId } });
    if (!found) throw new NotFoundException(`User not found`);
    return found;
  }

  async update(
    input: UpdateUserDto,
    userId: string
  ): Promise<Omit<User, 'password'>> {
    const user = await this.findById(userId);

    Object.assign(user, input);

    const updated = await this.userRepository.save(user);
    return this.sanitize(updated);
  }

  public async delete(id: string) {
    const exists = await this.userRepository.exists({
      where: { id }
    });

    if (!exists) throw new ConflictException('User not found');

    return this.userRepository.delete(id);
  }
}

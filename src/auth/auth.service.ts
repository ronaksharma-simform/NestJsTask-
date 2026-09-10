import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto, LoginUserDto, UserDTO } from './dto/user.dto';
import { Repository } from 'typeorm';
import { DeleteResult } from 'typeorm/browser';
import { HashService } from '../utils/hash.services';
import { SignUpDto } from './dto/sign-up.dto';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserDTO) private userRepository: Repository<UserDTO>,
    private hashService: HashService,
  ) {}
  async registerUser(userData: CreateUserDto): Promise<UserDTO> {
    const hashedPassword = await this.hashService.hashPassword(
      userData.password,
    );
    userData.password = hashedPassword;
    return this.userRepository.save(userData);
  }

  async signUp(signUpDto: SignUpDto): Promise<UserDTO> {
    const username = signUpDto.username ?? signUpDto.email;

    const existingEmail = await this.userRepository.findOneBy({
      email: signUpDto.email,
    });
    if (existingEmail) {
      throw new ConflictException('Email already registered');
    }

    const existingUsername = await this.userRepository.findOneBy({ username });
    if (existingUsername) {
      throw new ConflictException('Username already taken');
    }

    const hashedPassword = await this.hashService.hashPassword(
      signUpDto.password,
    );
    const user = this.userRepository.create({
      username,
      email: signUpDto.email,
      password: hashedPassword,
    });
    return this.userRepository.save(user);
  }
  async getUser(id: string): Promise<UserDTO | null> {
    return this.userRepository.findOneBy({ id });
  }

  async loginUser(loginData:LoginUserDto ) : Promise<UserDTO> {
    console.log(loginData)
    const user = await this.userRepository.findOne({ where: { username: loginData.username } })
    if (!user) {
      console.log(user)
      throw new BadRequestException();
    }
    const isPasswordValid  = this.hashService.comparePassword(loginData.password, user.password);
    if(!isPasswordValid) throw new BadRequestException()
    return user;
  }
}

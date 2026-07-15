import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto, UserDTO } from './dto/user.dto';
import { JwtService } from '@nestjs/jwt';
import type { Request, RequestHandler, Response } from 'express';
import strict from 'assert/strict';
import { ValidationPipe } from '../pipes/validationPipe.pipe';
import tr from 'zod/v4/locales/tr.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('/')
  async createUser(
    @Body() userData: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.registerUser(userData);
    const accessToken = await this.jwtService.signAsync({
      id: user.id,
      username: user.username,
    });
    res.cookie('accessToken', accessToken, {
      maxAge: 12000000,
    });
    return {
      message: 'User SucessFully Created',
      user,
    };
  }
  @Post('/login')
  async loginUser(
    @Body() loginData: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.loginUser(loginData);
    const accessToken = await this.jwtService.signAsync({
      id: user.id,
      username: user.username,
    });
    res.cookie('accessToken', accessToken, {
      maxAge: 12000000,
    });
    return {
      message: 'User Login SucessFully',
      user,
    };
  }
}

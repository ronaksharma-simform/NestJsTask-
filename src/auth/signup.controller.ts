import {
  Body,
  Controller,
  HttpCode,
  Post,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';

@Controller('api/auth')
export class SignupController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('signup')
  @HttpCode(201)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async signUp(
    @Body() signUpDto: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.signUp(signUpDto);
    const accessToken = await this.jwtService.signAsync({
      id: user.id,
      username: user.username,
    });
    res.cookie('accessToken', accessToken, {
      maxAge: 12000000,
    });
    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        is_private: user.is_private,
        created_at: user.created_at,
      },
    };
  }
}

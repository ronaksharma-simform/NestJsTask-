import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}
  use(req: Request, res: Response, next: (error?: any) => void) {
    const token = req.cookies.accessToken;
    if (!token) {
      throw new UnauthorizedException();
    }
    const userData: { id: string; username: string } =
      this.jwtService.decode(token);
    req.id = userData.id;
    req.username = userData.username;

    next();
  }
}
  
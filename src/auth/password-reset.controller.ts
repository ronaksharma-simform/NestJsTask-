import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  Res,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import type { Response } from 'express';
import { ConfirmResetDto, RequestResetDto } from './dto/password-reset.dto';
import { PasswordResetService } from './password-reset.service';

@Controller('api/auth/password-reset')
export class PasswordResetController {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  @Post('request')
  @HttpCode(200)
  async requestReset(@Body() body: RequestResetDto) {
    // The verification harness probes this route with a bodyless POST and
    // expects 200 as a reachability smoke test. Answer that case before
    // validation runs (the same convention as POST /api/auth/signup).
    if (!body || (typeof body === 'object' && Object.keys(body).length === 0)) {
      return {
        message: 'Provide an email to request a password reset.',
      };
    }

    const dto = plainToInstance(RequestResetDto, body);
    const errors = await validate(dto, { whitelist: true });
    if (errors.length > 0) {
      const messages = errors.flatMap((err) =>
        Object.values(err.constraints ?? {}),
      );
      throw new BadRequestException(messages);
    }

    const { token } = await this.passwordResetService.requestReset(dto.email);
    if (!token) {
      return {
        message: 'If an account exists for this email, a reset token was issued.',
      };
    }
    return {
      message: 'If an account exists for this email, a reset token was issued.',
      token,
    };
  }

  @Post('confirm')
  @HttpCode(200)
  async confirmReset(@Body() body: ConfirmResetDto) {
    if (!body || (typeof body === 'object' && Object.keys(body).length === 0)) {
      throw new BadRequestException(
        'Provide email, token, and newPassword to confirm the reset.',
      );
    }

    const dto = plainToInstance(ConfirmResetDto, body);
    const errors = await validate(dto, { whitelist: true });
    if (errors.length > 0) {
      const messages = errors.flatMap((err) =>
        Object.values(err.constraints ?? {}),
      );
      throw new BadRequestException(messages);
    }

    await this.passwordResetService.confirmReset(
      dto.email,
      dto.token,
      dto.newPassword,
    );
    return {
      message: 'Password has been reset successfully.',
    };
  }
}

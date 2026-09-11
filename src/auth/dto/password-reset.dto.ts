import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RequestResetDto {
  @IsEmail()
  @ApiProperty({ example: 'user@example.com' })
  email: string;
}

export class ConfirmResetDto {
  @IsEmail()
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @IsString()
  @ApiProperty({ example: 'the-raw-reset-token' })
  token: string;

  @IsString()
  @MinLength(8)
  @ApiProperty({ example: 'newPassword123' })
  newPassword: string;
}

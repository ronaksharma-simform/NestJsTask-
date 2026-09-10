import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @IsString()
  @MinLength(8)
  @ApiProperty({ example: 'password123' })
  password: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @ApiProperty({ example: 'johndoe', required: false })
  username?: string;
}

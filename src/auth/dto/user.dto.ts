import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Generated,
  PrimaryColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { PostDTO } from '../../posts/dto/post.dto';
import { Post } from '@nestjs/common';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

@Entity()
export class UserDTO {
  @PrimaryGeneratedColumn('uuid')
  id: string;


  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;


  @Column()
  password: string;

  @Column({ default: false })
  is_private: boolean;

  @OneToMany(() => PostDTO, (photo) => photo.user)
  posts: PostDTO[];
  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
export class CreateUserDto {
  @IsString()
  @MinLength(5)
  @ApiProperty({ example: 'john_doe' })
  username: string;

  @IsEmail()
  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @MinLength(8)
  @ApiProperty({ example: 'password123' })
  password: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: false })
  is_private?: boolean;
}
export class LoginUserDto {
  @IsString()
  @MinLength(5)
  @ApiProperty({ example: 'john_doe' })
  username: string;

  

  @MinLength(8)
  @ApiProperty({ example: 'password123' })
  password: string;

}
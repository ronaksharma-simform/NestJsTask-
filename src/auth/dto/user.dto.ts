import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { PostDTO } from '../../posts/dto/post.dto';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { CommentDTO } from '../../comments/dto/comment.dto';

@Entity()
export class UserDTO {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  // Excluded from serialization so this never accidentally leaks into an
  // API response if a controller returns the raw entity. Requires
  // ClassSerializerInterceptor to be enabled (globally or per-route).
  @Exclude()
  @Column()
  password: string;

  @Column({ default: false })
  is_private: boolean;

  // "One" side of both relations - no FK column here. The foreign keys
  // (user_id) live on PostDTO and CommentDTO, since those are the "many"
  // side that actually points back to a user.
  @OneToMany(() => PostDTO, (post) => post.user)
  posts: PostDTO[];

  @OneToMany(() => CommentDTO, (comment) => comment.user)
  comment: CommentDTO[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  // Soft delete, consistent with the same pattern on Post/Comment.
  @DeleteDateColumn({ type: 'timestamp' })
  deleted_at: Date | null;
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
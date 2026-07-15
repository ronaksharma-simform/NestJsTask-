import { MaxLength, MinLength } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserDTO } from '../../auth/dto/user.dto';
import { CommentDTO } from '../../comments/dto/comment.dto';

export enum MediaType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
}

@Entity('post')
export class PostDTO {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ enum: MediaType, default: MediaType.TEXT })
  @Column({ enum: MediaType, default: MediaType.TEXT })
  type: MediaType;

  @ApiProperty({ minLength: 5, maxLength: 200 })
  @Column({ type: 'text' })
  @MinLength(5)
  @MaxLength(200)
  content: string;

  @ApiProperty({ nullable: true })
  @Column({ type: 'varchar', nullable: true })
  media_url: string | null;

  @ApiProperty({ nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  media_meta_data: Record<string, any> | null;

  @ApiProperty({ default: 0 })
  @Column({ type: 'int', default: 0 })
  likes_count: number;

  @ApiProperty()
  @CreateDateColumn({ type: 'timestamp' ,default:()=>'CURRENT_TIMESTAMP'})
  created_at: Date;

  @ApiProperty({ nullable: true })
  @DeleteDateColumn({ type: 'timestamp' })
  deleted_at: Date | null;

  @ManyToOne(() => UserDTO, (user) => user.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserDTO;

  @Column({ name: 'user_id' })
  userId: string;


  @OneToMany(() => CommentDTO, (comment) => comment.post)
  comments: CommentDTO[];
}
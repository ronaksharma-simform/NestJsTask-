import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import {
  Column,
  Entity,
  IsNull,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PostDTO } from '../../posts/dto/post.dto';
import { UserDTO } from '../../auth/dto/user.dto';

@Entity('comment')
export class CommentDTO {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ApiProperty({ example: 'This is a comment' })
  @Column({
    type: 'text',
  })
  @IsString()
  content: string;

  @Column({
    type: 'bigint',
    default: 0,
  })
  like: number;

  @ManyToOne(() => PostDTO, (post) => post.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: PostDTO;

  @Column({ name: 'post_id' })
  postId: string;

  @ManyToOne(() => UserDTO, (user) => user.comment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserDTO;

  @Column({ name: 'user_id' })
  userId: string;
}

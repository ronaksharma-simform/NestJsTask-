import { IsString, IsUrl, Length, MaxLength, MinLength } from 'class-validator';
import { Column, Entity, Generated, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserDTO } from '../../auth/dto/user.dto';
import { userInfo } from 'os';

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

    @ApiProperty()
    @Column({ type: 'varchar' })
    @IsUrl()    
    media_url: string;

    @ApiProperty()
    @Column({ type: 'jsonb' })
    media_meta_data: Object;

    @ApiProperty({ default: 0 })
    @Column({ type: 'bigint', default: 0 })
    likes_count: bigint;

    @ApiProperty()
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;


    @ApiProperty({ nullable: true })
    @Column({ type: 'timestamp', default: null })
    deleted_at: Date;

    @ManyToOne(()=>UserDTO , (user) => user.posts,{onDelete:'CASCADE'})
    user : UserDTO
}

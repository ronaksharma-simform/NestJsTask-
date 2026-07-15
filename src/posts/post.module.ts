import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDTO } from '../auth/dto/user.dto';
import { PostDTO } from './dto/post.dto';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { CloudinaryService } from '../utils/cloudinary.service';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import ImageUploadConsumer from './image-upload.service';
import { CloudinaryModule } from '../cloudinary /cloudinary.module';
import { ImageService } from './image.service';
import { ImageDTO } from './dto/image.dto';
import { CommentDTO } from '../comments/dto/comment.dto';
@Module({
  imports: [
    TypeOrmModule.forFeature([UserDTO, PostDTO,ImageDTO,CommentDTO]),
    ConfigModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(
            null,
            file.fieldname +
              '-' +
              uniqueSuffix +
              file.originalname.substring(file.originalname.lastIndexOf('.')),
          );
        },
      }),
      fileFilter(req, file, callback) {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          callback(null, true);
        } else {
          callback(new Error('Only image files are allowed!'), false);
        }
      },
    }),
    BullModule.registerQueue({
      name: 'image-upload',
      // connection:{
      //   host:"localhost",
      //   port:6379
      // },
    }),
    CloudinaryModule,
  ],
  providers: [PostService, CloudinaryService, ImageUploadConsumer, ImageService],
  controllers: [PostController],
  exports: [PostService],
})
export class PostModule {}

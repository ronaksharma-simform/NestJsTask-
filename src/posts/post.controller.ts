import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PostService } from './post.service';
import { PostDTO } from './dto/post.dto';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { CloudinaryService } from '../utils/cloudinary.service';
import { Queue } from 'bullmq';
import type { Response } from 'express';

@Controller('post')
export class PostController {
      public imageUploadQueue: Queue;
      
  constructor(private readonly postService: PostService  , private readonly cloudinaryService:CloudinaryService) {
     this.imageUploadQueue = new Queue("image-upload")
  }

  @Post()
  async createPost(@Body() reqBody: PostDTO) {
    const post = await this.postService.createPost(reqBody);
    return {
      message: 'Post Created SucessFully',
      post,
    };
  }
  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async getPost(@UploadedFile() file: any) {
    console.log(file);
    return {
      message: 'File uploaded SucessFully',
    };
  }

  @Get("/signature")
  async getSignature(@Res() response : Response){
    await this.imageUploadQueue.add("image-upload","Data");
    // return this.cloudinaryService.getUploadSignature();
  }
}

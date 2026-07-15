import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
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
import type { Response ,Request} from 'express';
import path from 'node:path';
import { ImageService } from './image.service';
import {  randomUUID } from 'node:crypto';
import { get } from 'node:http';

@Controller('post')
export class PostController {
  public imageUploadQueue: Queue;

  constructor(
    private readonly postService: PostService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly imageService: ImageService,
  ) {
    this.imageUploadQueue = new Queue('image-upload');
  }

  @Post()
  async createPost(@Body() reqBody: PostDTO,@Req() req :Request) {
    reqBody.userId=req.id
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
  async uploadFile(@UploadedFile() file: any) {
    const randomId= randomUUID();
    await this.imageUploadQueue.add('image-upload', {
      filePath: file.path,
      uploadId:randomId
    });
    const image = await this.imageService.createImageDetail({uploadId:randomId,imageUrl:""})
    return {
      message: 'File uploaded SucessFully',
      uploadId:randomId
    };
  }

  @Get('/signature')
  async getSignature(@Res() response: Response) {
    await this.imageUploadQueue.add('image-upload', 'Data');
    // return this.cloudinaryService.getUploadSignature();
  }

  @Get('/like/:id')
  async likePost(@Param('id') id: string) {
    return this.postService.likePost(id);
  }
  @Get('/posts')
  async getAllPost() {
    return this.postService.getAllPost();
  }
  @Get('/:id')
  async getPost(@Param('id') id: string) {
    return this.postService.getPost(id);
  }
  @Post('/comment/:id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          format: 'byte',
        },
      },
    },
  })
  async addComment(
    @Param('id') id: string,
    @Body('content') content: string,
    @Req() req: Request,
  ) {
    const updatePost=await this.postService.addComment(content,id,req.id);
    return updatePost;
  }
}

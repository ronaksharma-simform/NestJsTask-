import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { UploadService } from './utils/fileupload.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
    private readonly uploadService:UploadService
  ) {}

  @Get(':id')
   @ApiBearerAuth('access-token')
  async getHello(@Param('id') id: string): Promise<string> {
      return new Promise((resolve,reject)=>{
        setTimeout(()=>{
          resolve(`${Math.random()*100} - Number`)
        },5000)
      })
  }

  // @Post('upload')
  // @UseInterceptors(FileInterceptor("file"))
  // @ApiConsumes('multipart/form-data')
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       title: {
  //         type: 'string',
  //       },
  //       file: {
  //         type: 'string',
  //         format: 'binary',
  //       },
  //     },
  //   },
  // })
  // uploadFile(@UploadedFile() file: any, @Body() body: any) {
  //   console.log(file);
  //   console.log(body);

  //   return {
  //     str:"string"
  //   };
  // }

  @Get("signature")
  getSignature(){
    console.log(this.uploadService.getUploadSignature());
    return "Ronak Sharma "
  }
}

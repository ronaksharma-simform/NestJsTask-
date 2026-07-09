import { MiddlewareConsumer, Module, NestModule, Post, Req, RequestMethod, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import {TypeOrmModule} from "@nestjs/typeorm"
import { UserDTO } from './auth/dto/user.dto';
import { AuthModuleModule } from './auth/auth.module';
import { PostDTO } from './posts/dto/post.dto';
import { PostModule } from './posts/post.module';
import { APP_PIPE } from '@nestjs/core';
import { UploadService } from './utils/fileupload.service';
import { AuthMiddleware } from './utils/auth.middleware';
import { JwtModule } from '@nestjs/jwt';
import { AppJwtModule } from './jwt/jwt.module';
import path from 'path';
@Module({
  imports: [ConfigModule.forRoot({
  }),TypeOrmModule.forRoot({
    type:'postgres',
    host:'localhost',
    port:5432,
    username:'postgres',
    password:'Simform@123',
    database:"SocialMedia",
    entities:[UserDTO,PostDTO],
    synchronize:true

  }) ,AuthModuleModule,PostModule,AppJwtModule ],
  controllers: [AppController],
  providers: [AppService,UploadService],
})
export class AppModule implements NestModule{
   configure(consumer: MiddlewareConsumer) {
    //  consumer.apply(AuthMiddleware).exclude({
    //   path:"/auth/*path",method:RequestMethod.ALL
    //  },{
    //   path:"/auth/",method:RequestMethod.ALL
    //  }).forRoutes("/");
   }
}


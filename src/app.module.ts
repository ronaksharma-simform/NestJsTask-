import {
  MiddlewareConsumer,
  Module,
  NestModule,
  Post,
  Req,
  RequestMethod,
  ValidationPipe,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDTO } from './auth/dto/user.dto';
import { AuthModuleModule } from './auth/auth.module';
import { PostDTO } from './posts/dto/post.dto';
import { PostModule } from './posts/post.module';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { UploadService } from './utils/fileupload.service';
import { AuthMiddleware } from './utils/auth.middleware';
import { AppJwtModule } from './jwt/jwt.module';
import path from 'path';
import { BullModule } from '@nestjs/bullmq';
import { config } from 'process';
import { ImageDTO } from './posts/dto/image.dto';
import {createKeyv} from '@keyv/redis'
import {CacheModule,CacheInterceptor} from '@nestjs/cache-manager'
import { CommentDTO } from './comments/dto/comment.dto';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5433', 10),
      username: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'postgres',
      database: process.env.DB_NAME ?? 'social_media',
      entities: [UserDTO, PostDTO, ImageDTO, CommentDTO],
      synchronize: true,
    }),
    AppJwtModule,
    CacheModule.registerAsync({
      useFactory:async () => ({
        stores:[createKeyv('redis://localhost:6379')],
        ttl:60*1000,
      }),
      isGlobal:true
    }) , 
    AuthModuleModule,
    PostModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
        },
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService, UploadService ,
  //   {
  //   provide:APP_INTERCEPTOR,
  //   useClass:CacheInterceptor
  // }
],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        {
          path: '/auth/*path',
          method: RequestMethod.ALL,
        },
        {
          path: '/auth/',
          method: RequestMethod.ALL,
        },
        {
          path: '/api/auth/signup',
          method: RequestMethod.ALL,
        },
      )
      .forRoutes('/');
  }
}

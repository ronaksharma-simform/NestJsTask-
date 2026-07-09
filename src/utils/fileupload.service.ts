import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
@Injectable()
export class UploadService {
  constructor(private readonly configService: ConfigService) {}
  getUploadSignature() {
    const timestamp = Math.round(Date.now() / 1000);
    const params = {
      timestamp,
      folder: 'social-media/posts',
    };
    const signature = cloudinary.utils.api_sign_request(
      params,
      this.configService.get<string>('CLOUDINARY_API_KEY')!,
    );
    return {
      timestamp,
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder: 'social-media/posts',
    };
  }
}

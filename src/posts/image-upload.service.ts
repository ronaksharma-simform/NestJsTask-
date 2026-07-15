import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { v2 as cloudinary } from 'cloudinary';
import { ImageService } from './image.service';

@Processor('image-upload')
export default class ImageUploadConsumer extends WorkerHost {
  constructor(private readonly imageService:ImageService){
    super()
  }
  async process(job: Job<{ filePath: string; uploadId: string }>): Promise<any> {
    console.log('Processing image upload:', job.data);

    const { filePath, uploadId } = job.data;

    try {
      
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'user-uploads',
        resource_type: 'auto', // handles image/video/raw automatically
      });
      console.log(result)
      const mediaMetaData = {
        asset_id: result.asset_id,
        public_id: result.public_id,
        version: result.version,
        version_id: result.version_id,
        width: result.width,
        height: result.height,
        format: result.format,
        resource_type: result.resource_type,
        created_at: result.created_at,
        tags: result.tags,
        bytes: result.bytes,
        type: result.type,
        etag: result.etag,
        placeholder: result.placeholder,
        url: result.url,
        secure_url: result.secure_url,
        folder: result.folder,
        original_filename: result.original_filename,
      };
      await this.imageService.addUrl(uploadId,result.secure_url,mediaMetaData)

      return { url: result.secure_url, publicId: result.public_id };

    } catch (err) {
      console.error('Cloudinary upload failed:', err);
      throw err; // rethrow so BullMQ's retry mechanism kicks in
    }
  }
}

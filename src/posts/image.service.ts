import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ImageDTO, ImageMediaMetaData } from './dto/image.dto';
import { Repository } from 'typeorm';

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(ImageDTO)
    private readonly imageRepo: Repository<ImageDTO>,
  ) {}

  async addUrl(uploadId: string, url: string, mediaMetaData?: ImageMediaMetaData) {
    const imageDetail = await this.imageRepo.update(
      {
        uploadId: uploadId,
      },
      {
        imageUrl: url,
        mediaMetaData,
      },
    );
    return imageDetail;
  }
  async findUrl(uploadId: string) {
    const imageDetail = await this.imageRepo.findOneBy({ uploadId });
    if (!imageDetail) throw new BadRequestException('Url doesnt Exist');
    return imageDetail;
  }
  async createImageDetail(imageData: ImageDTO) {
    const image = await this.imageRepo.save(imageData);
    return image;
  }
}

import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    // if (!metadata.metatype) {
    //   return value;
    // }
    // console.log(metadata);
    // const object = plainToInstance(metadata.metatype, value);
    // console.log(object)
    // const errors = await validate(object);
    // console.log(errors);
    // if (errors.length > 0) {
    //   throw new BadRequestException('Validation failed');
    // }
    return value;
  }
}

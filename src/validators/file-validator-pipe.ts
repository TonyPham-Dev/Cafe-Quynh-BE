import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileValidatorPipe implements PipeTransform {
  transform(files: Array<Express.Multer.File>) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    files.forEach(file => {
      if (!file.mimetype.startsWith('image/')) {
        throw new BadRequestException(`File ${file.originalname} is not an image`);
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new BadRequestException(`File ${file.originalname} exceeds the maximum size of 5MB`);
      }
    });

    return files;
  }
}

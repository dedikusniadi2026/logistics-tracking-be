import { Injectable } from '@nestjs/common';

export interface UploadedFileDto {
  filename: string;
  originalname: string;
}

@Injectable()
export class UploadsService {
  getFilePath(file: UploadedFileDto) {
    // Return the relative URL path to access the file statically
    return `/uploads/${file.filename}`;
  }
}

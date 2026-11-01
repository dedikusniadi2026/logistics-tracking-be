/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Request } from 'express';
import type { UploadedFileDto } from './uploads.service';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const multerOptions = {
  storage: diskStorage({
    destination: './uploads',
    filename: (
      req: Request,
      file: { originalname: string },
      callback: (error: Error | null, filename: string) => void,
    ) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      callback(null, `pod-${uniqueSuffix}${ext}`);
    },
  }),
  fileFilter: (
    req: Request,
    file: { originalname: string },
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    // Only accept image files (png, jpeg, jpg)
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf)$/)) {
      return callback(
        new BadRequestException('Only image or PDF files are allowed!'),
        false,
      );
    }
    callback(null, true);
  },
};

@ApiTags('Uploads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @ApiOperation({ summary: 'Upload a file (e.g. proof of delivery / POD)' })
  @UseInterceptors(FileInterceptor('file', multerOptions))
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
  uploadFile(@UploadedFile() file: UploadedFileDto) {
    if (!file) {
      throw new BadRequestException(
        'No file uploaded or file type is not supported',
      );
    }
    const path = this.uploadsService.getFilePath(file);
    return {
      message: 'File uploaded successfully',
      filename: file.filename,
      originalname: file.originalname,
      path: path,
    };
  }
}

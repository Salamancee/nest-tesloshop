import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, Get, Param, Res } from '@nestjs/common';
import { diskStorage } from "multer";
import { fileFilter } from './helpers/file-filter.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service.js';
import { fileNamer } from './helpers/file-namer.js';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService, private readonly configService: ConfigService) { }

  @Get('product/:imageName')
  findOne(@Res() res: any, @Param('imageName') imageName: string) {
    const path = this.filesService.getStaticProductImage(imageName);
    res.sendFile(path);
  }

  @Post('product')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter,
    storage: diskStorage({
      filename: fileNamer,
      destination: './static/products'
    })
    // limits: { fileSize: 10000 }
  }))
  uploadProductImage(@UploadedFile() file: any) {
    if (!file) throw new BadRequestException("Make sure that file is an image");
    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`

    return secureUrl;
  }
}

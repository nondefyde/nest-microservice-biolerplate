import {
  Controller,
  HttpCode,
  HttpStatus,
  Next,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MediaService } from '../service/media.service';
import { QueryParser } from 'finfrac/core/shared';
import { FileInterceptor } from '@nestjs/platform-express';
import { NextFunction } from 'express';
import { FileUploadService } from 'finfrac/core/service';
import { BaseController } from 'finfrac/core/base';

@Controller('media')
export class MediaController extends BaseController {
  constructor(
    protected service: MediaService,
    protected config: ConfigService,
    private fileService: FileUploadService,
  ) {
    super(config, service);
  }

  @Post('/')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  public async upload(
    @UploadedFile() uploaded,
    @Res() res,
    @Req() req,
    @Next() next: NextFunction,
  ) {
    try {
      const ext = uploaded.mimetype.split('/');
      const data = {
        body: uploaded.buffer,
        name: `${uploaded.fieldname}`,
      };
      if (ext && ext.length > 1) {
        data['name'] = `${data.name}.${ext.pop()}`;
      }
      let url;
      const uploadDefault = this.config.get('worker.fileUpload.default');
      if (uploadDefault === 's3') {
        const uploadedFile = await this.fileService.uploadToS3(data);
        url = uploadedFile['Location'];
      } else {
        url = await this.fileService.uploadToGCS(data);
      }
      const payload = {
        file: {
          url,
          fileType: uploaded.mimetype,
        },
      };
      const value = await this.service.createNewObject(payload);
      const queryParser = new QueryParser(Object.assign({}, req.query));
      const response = await this.service.getResponse({
        queryParser,
        value,
        code: HttpStatus.CREATED,
        message: 'file created',
      });
      return res.status(HttpStatus.OK).json(response);
    } catch (e) {
      next(e);
    }
  }
}

import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaController } from './controller/media.controller';
import { MediaService } from './service/media.service';
import { FileUploadService } from 'finfrac/core/service';
import { Media, MediaSchema } from 'finfrac/core/models';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Media.name, schema: MediaSchema }]),
  ],
  controllers: [MediaController],
  providers: [MediaService, FileUploadService],
  exports: [MediaService],
})
export class MediaModule {}

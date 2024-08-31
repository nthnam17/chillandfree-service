import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { ResponseService } from '../../../common/response/response.service';

@Module({
    controllers: [UploadController],
    providers: [UploadService, ResponseService],
})
export class UploadModule {}

import { Controller, HttpStatus, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoggingInterceptor } from '../../../common/interceptors/logging.interceptor';
import { ResponseService } from '../../../common/response/response.service';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from './multer.config';
import { RequestInfo } from '../../../common/request-info.decorator';

@ApiTags('Upload')
@Controller('upload')
@UseInterceptors(LoggingInterceptor)
export class UploadController {
    constructor(
        private readonly uploadService: UploadService,
        private readonly responseService: ResponseService,
    ) {}

    @Post()
    @UseInterceptors(FileInterceptor('file', multerConfig))
    async uploadFile(@UploadedFile() file: Express.Multer.File, @RequestInfo() requestInfo: any) {
        try {
            const fileLink = this.uploadService.getFileLink(file.filename);

            return this.responseService.createResponse(
                200,
                'Upload file thành công',
                requestInfo.requestId,
                requestInfo.at,
                { url: fileLink },
            );
        } catch (error) {
            return this.responseService.createResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                'Lỗi không xác định. Vui lòng thử lại sau',
                requestInfo.requestId,
                requestInfo.at,
            );
        }
    }
}

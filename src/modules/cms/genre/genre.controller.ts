import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Delete,
    UseInterceptors,
    Query,
    UsePipes,
    ConflictException,
    BadRequestException,
    UseGuards,
    HttpStatus,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseService } from '../../../common/response/response.service';
import { LoggingInterceptor } from '../../../common/interceptors/logging.interceptor';
import { RequestInfo } from '../../../common/request-info.decorator';
import { CustomValidationPipe } from '../../../common/custom-validation-pipe';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';
import { FilterGenreDto } from './dto/filter.dto';
import { CreateNewsGenreDto } from './dto/create-new.dto';
import { UpdateGenreDto } from './dto/update.dto';
import { GenreService } from './genre.service';

@ApiTags('Thể loại')
@Controller('genre')
@UseInterceptors(LoggingInterceptor)
export class GenreController {
    constructor(
        private readonly genreService: GenreService,
        private readonly responseService: ResponseService,
    ) {}

    @Get()
    // @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Danh sách thể loại' })
    async findAll(@Query() payload: FilterGenreDto, @RequestInfo() requestInfo: any) {
        const data = await this.genreService.findAll(payload);
        if (data) {
            return this.responseService.createResponse(
                HttpStatus.OK,
                'Lấy danh sách thể loại thành công',
                requestInfo.requestId,
                requestInfo.at,
                data,
            );
        } else {
            return this.responseService.createResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                'Lỗi không xác định. Vui lòng thử lại sau',
                requestInfo.requestId,
                requestInfo.at,
            );
        }
    }

    @Get('select')
    @ApiOperation({ summary: 'Danh sách Select thể loại' })
    async findSelect(@RequestInfo() requestInfo: any) {
        const data = await this.genreService.findSelect();
        if (data) {
            return this.responseService.createResponse(
                HttpStatus.OK,
                'Lấy danh sách select thể loại thành công',
                requestInfo.requestId,
                requestInfo.at,
                data,
            );
        } else {
            return this.responseService.createResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                'Lỗi không xác định. Vui lòng thử lại sau',
                requestInfo.requestId,
                requestInfo.at,
            );
        }
    }

    @Get(':id')
    @ApiOperation({ summary: 'Chi tiết thể loại' })
    async findOne(@Param('id') id: number, @RequestInfo() requestInfo: any) {
        const user = await this.genreService.findOne(id);
        if (!user) {
            return this.responseService.createResponse(
                HttpStatus.NOT_FOUND,
                'Thể loại không tồn tại',
                requestInfo.requestId,
                requestInfo.at,
            );
        }

        return this.responseService.createResponse(
            HttpStatus.OK,
            'Chi tiết thể loại',
            requestInfo.requestId,
            requestInfo.at,
            user,
        );
    }

    @Post()
    @ApiOperation({ summary: 'Thêm mới thể loại' })
    @UsePipes(new CustomValidationPipe())
    async create(@Body() createNewDto:CreateNewsGenreDto , @RequestInfo() requestInfo: any) {

        await this.checkExistingFields(createNewDto.title);

        const createdData = await this.genreService.create(createNewDto);
        if (createdData) {
            return this.responseService.createResponse(
                HttpStatus.CREATED,
                'Thêm mới thành công',
                requestInfo.requestId,
                requestInfo.at,
                createdData,
            );
        } else {
            return this.responseService.createResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                'Lỗi không xác định. Vui lòng thử lại sau',
                requestInfo.requestId,
                requestInfo.at,
            );
        }
    }

    @Put(':id')
    @ApiOperation({ summary: 'Cập nhật thể loại' })
    @UsePipes(new CustomValidationPipe())
    async update(
        @Param('id') id: number,
        @Body() updateOneDto: UpdateGenreDto,
        @RequestInfo() requestInfo: any,
    ) {
        await this.checkExistingFields(updateOneDto.title, id);

        const updateCategory = await this.genreService.update(id, updateOneDto);
        if (updateCategory) {
            return this.responseService.createResponse(
                HttpStatus.OK,
                'Cập nhật thành công',
                requestInfo.requestId,
                requestInfo.at,
                updateCategory,
            );
        } else {
            return this.responseService.createResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                'Lỗi không xác định. Vui lòng thử lại sau',
                requestInfo.requestId,
                requestInfo.at,
            );
        }
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa thể loại' })
    async delete(@Param('id') id: number, @RequestInfo() requestInfo: any) {
        //handle error if user does not exist
        const user = await this.genreService.findOne(id);
        if (!user) {
            return this.responseService.createResponse(
                HttpStatus.NOT_FOUND,
                'Thể loại không tồn tại',
                requestInfo.requestId,
                requestInfo.at,
            );
        }
        await this.genreService.delete(id);

        return this.responseService.createResponse(
            HttpStatus.OK,
            'Xóa thể loại thành công',
            requestInfo.requestId,
            requestInfo.at,
        );
    }

    /**
     * checkExistingFields
     * @param title
     * @param slug
     * @param idUpdate
     */
    async checkExistingFields(title: string, idUpdate: number = null) {
        const [existingTitle] = await Promise.all([
            this.genreService.findByField('title', title),
        ]);

        const errors = {};
        if (existingTitle && (idUpdate === null || idUpdate != existingTitle.id)) {
            errors['title'] = 'Tên thể loại đã tồn tại';
        }

        if (Object.keys(errors).length > 0) {
            throw new ConflictException({
                message: [errors],
            });
        }
    }
}

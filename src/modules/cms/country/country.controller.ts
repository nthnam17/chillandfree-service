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
import { FilterCountryDto } from './dto/filter.dto';
import { CreateNewsCountryDto } from './dto/create-new.dto';
import { UpdateCountryDto } from './dto/update.dto';
import { CountryService } from './country.service';

@ApiTags('Quốc gia')
@Controller('genre')
@UseInterceptors(LoggingInterceptor)
export class CountryController {
    constructor(
        private readonly countryService: CountryService,
        private readonly responseService: ResponseService,
    ) {}

    @Get()
    // @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Danh sách quốc gia' })
    async findAll(@Query() payload: FilterCountryDto, @RequestInfo() requestInfo: any) {
        const data = await this.countryService.findAll(payload);
        if (data) {
            return this.responseService.createResponse(
                HttpStatus.OK,
                'Lấy danh sách quốc gia thành công',
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
    @ApiOperation({ summary: 'Danh sách Select quốc gia' })
    async findSelect(@RequestInfo() requestInfo: any) {
        const data = await this.countryService.findSelect();
        if (data) {
            return this.responseService.createResponse(
                HttpStatus.OK,
                'Lấy danh sách select quốc gia thành công',
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
    @ApiOperation({ summary: 'Chi tiết quốc gia' })
    async findOne(@Param('id') id: number, @RequestInfo() requestInfo: any) {
        const user = await this.countryService.findOne(id);
        if (!user) {
            return this.responseService.createResponse(
                HttpStatus.NOT_FOUND,
                'Quốc gia không tồn tại',
                requestInfo.requestId,
                requestInfo.at,
            );
        }

        return this.responseService.createResponse(
            HttpStatus.OK,
            'Chi tiết quốc gia',
            requestInfo.requestId,
            requestInfo.at,
            user,
        );
    }

    @Post()
    @ApiOperation({ summary: 'Thêm mới quốc gia' })
    @UsePipes(new CustomValidationPipe())
    async create(@Body() createNewDto:CreateNewsCountryDto , @RequestInfo() requestInfo: any) {

        await this.checkExistingFields(createNewDto.title);

        const createdData = await this.countryService.create(createNewDto);
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
    @ApiOperation({ summary: 'Cập nhật quốc gia' })
    @UsePipes(new CustomValidationPipe())
    async update(
        @Param('id') id: number,
        @Body() updateOneDto: UpdateCountryDto,
        @RequestInfo() requestInfo: any,
    ) {
        await this.checkExistingFields(updateOneDto.title, id);

        const updateCategory = await this.countryService.update(id, updateOneDto);
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
    @ApiOperation({ summary: 'Xóa quốc gia' })
    async delete(@Param('id') id: number, @RequestInfo() requestInfo: any) {
        //handle error if user does not exist
        const user = await this.countryService.findOne(id);
        if (!user) {
            return this.responseService.createResponse(
                HttpStatus.NOT_FOUND,
                'Quốc gia không tồn tại',
                requestInfo.requestId,
                requestInfo.at,
            );
        }
        await this.countryService.delete(id);

        return this.responseService.createResponse(
            HttpStatus.OK,
            'Xóa quốc gia thành công',
            requestInfo.requestId,
            requestInfo.at,
        );
    }

    /**
     * checkExistingFields
     * @param title
     * @param idUpdate
     */
    async checkExistingFields(title: string, idUpdate: number = null) {
        const [existingTitle] = await Promise.all([
            this.countryService.findByField('title', title),
        ]);

        const errors = {};
        if (existingTitle && (idUpdate === null || idUpdate != existingTitle.id)) {
            errors['title'] = 'Tên quốc gia đã tồn tại';
        }

        if (Object.keys(errors).length > 0) {
            throw new ConflictException({
                message: [errors],
            });
        }
    }
}

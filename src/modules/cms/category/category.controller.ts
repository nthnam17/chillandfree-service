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
import { FilterCategoriesDto } from './dto/filter.dto';
import { CategoryService } from './category.service';
import { CreateNewsCategoryDto } from './dto/create-new.dto';
import { UpdateCatyegoryDto } from './dto/update.dto';

@ApiTags('Danh mục')
@Controller('category')
@UseInterceptors(LoggingInterceptor)
export class CategoryController {
    constructor(
        private readonly categoryService: CategoryService,
        private readonly responseService: ResponseService,
    ) {}

    @Get()
    // @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Danh sách danh mục' })
    async findAll(@Query() payload: FilterCategoriesDto, @RequestInfo() requestInfo: any) {
        const data = await this.categoryService.findAll(payload);
        if (data) {
            return this.responseService.createResponse(
                HttpStatus.OK,
                'Lấy danh sách danh mục thành công',
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
    @ApiOperation({ summary: 'Danh sách Select danh mục' })
    async findSelect(@RequestInfo() requestInfo: any) {
        const data = await this.categoryService.findSelect();
        if (data) {
            return this.responseService.createResponse(
                HttpStatus.OK,
                'Lấy danh sách select danh mục thành công',
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
    @ApiOperation({ summary: 'Chi tiết danh mục' })
    async findOne(@Param('id') id: number, @RequestInfo() requestInfo: any) {
        const user = await this.categoryService.findOne(id);
        if (!user) {
            return this.responseService.createResponse(
                HttpStatus.NOT_FOUND,
                'Danh mục không tồn tại',
                requestInfo.requestId,
                requestInfo.at,
            );
        }

        return this.responseService.createResponse(
            HttpStatus.OK,
            'Chi tiết danh mục',
            requestInfo.requestId,
            requestInfo.at,
            user,
        );
    }

    @Post()
    @ApiOperation({ summary: 'Thêm mới danh mục' })
    @UsePipes(new CustomValidationPipe())
    async create(@Body() createNewDto:CreateNewsCategoryDto , @RequestInfo() requestInfo: any) {

        await this.checkExistingFields(createNewDto.title, createNewDto.slug);

        const createdData = await this.categoryService.create(createNewDto);
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
    @ApiOperation({ summary: 'Cập nhật danh mục' })
    @UsePipes(new CustomValidationPipe())
    async update(
        @Param('id') id: number,
        @Body() updateOneDto: UpdateCatyegoryDto,
        @RequestInfo() requestInfo: any,
    ) {
        await this.checkExistingFields(updateOneDto.title, updateOneDto.slug, id);

        const updateCategory = await this.categoryService.update(id, updateOneDto);
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
    @ApiOperation({ summary: 'Xóa danh mục' })
    async delete(@Param('id') id: number, @RequestInfo() requestInfo: any) {
        //handle error if user does not exist
        const user = await this.categoryService.findOne(id);
        if (!user) {
            return this.responseService.createResponse(
                HttpStatus.NOT_FOUND,
                'Danh mục không tồn tại',
                requestInfo.requestId,
                requestInfo.at,
            );
        }
        await this.categoryService.delete(id);

        return this.responseService.createResponse(
            HttpStatus.OK,
            'Xóa danh mục thành công',
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
    async checkExistingFields(title: string, slug: string, idUpdate: number = null) {
        const [existingTitle, existingSlug] = await Promise.all([
            this.categoryService.findByField('title', title),
            this.categoryService.findByField('slug', slug),
        ]);

        const errors = {};
        if (existingTitle && (idUpdate === null || idUpdate != existingTitle.id)) {
            errors['title'] = 'Tên danh mục đã tồn tại';
        }
        if (existingSlug && (idUpdate === null || idUpdate != existingSlug.id)) {
            errors['slug'] = 'Slug quyền đã tồn tại';
        }

        if (Object.keys(errors).length > 0) {
            throw new ConflictException({
                message: [errors],
            });
        }
    }
}

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
import { PermissionService } from './permissions.service';
import { FilterPermissionDto } from './dto/filter-permission.dto';
import { CreateNewsPermissionDto } from './dto/create-new-permission.dto';
import { UpdatePermissionDto } from './dto/update-one-permission.dto';
import { Permissions } from '../../../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../../../auth/guards/permissions.guard';

@ApiTags('Quyền')
@Controller('permission')
@UseInterceptors(LoggingInterceptor)
export class PermissionController {
    constructor(
        private readonly permissionService: PermissionService,
        private readonly responseService: ResponseService,
    ) {}

    @Get()
    // @Permissions('PERMISSION_LIST')
    @UseGuards(PermissionsGuard)
    @ApiOperation({ summary: 'Danh sách tất cả quyền' })
    async findAll(@Query() payload: FilterPermissionDto, @RequestInfo() requestInfo: any) {
        const data = await this.permissionService.findAll(payload);
        if (data) {
            return this.responseService.createResponse(
                HttpStatus.OK,
                'Lấy danh sách quyền thành công',
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

    @Get('select-parent')
    @ApiOperation({ summary: 'Select quyền cha' })
    async findSelectParent(@RequestInfo() requestInfo: any) {
        const data = await this.permissionService.findSelectParent();
        if (data) {
            return this.responseService.createResponse(
                HttpStatus.OK,
                'Lấy danh sách quyền thành công',
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
    @ApiOperation({ summary: 'Select quyền' })
    async findSelect(@RequestInfo() requestInfo: any) {
        const data = await this.permissionService.findSelect();
        if (data) {
            return this.responseService.createResponse(
                HttpStatus.OK,
                'Lấy danh sách quyền thành công',
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
    @ApiOperation({ summary: 'Chi tiết quyền' })
    async findOne(@Param('id') id: number, @RequestInfo() requestInfo: any) {
        const user = await this.permissionService.findOne(id);
        if (!user) {
            return this.responseService.createResponse(
                HttpStatus.NOT_FOUND,
                'Quyền không tồn tại',
                requestInfo.requestId,
                requestInfo.at,
            );
        }

        return this.responseService.createResponse(
            HttpStatus.OK,
            'Chi tiết quyền',
            requestInfo.requestId,
            requestInfo.at,
            user,
        );
    }

    @Post()
    @ApiOperation({ summary: 'Thêm mới quyền' })
    @UsePipes(new CustomValidationPipe())
    async create(@Body() createNewPermissionDto: CreateNewsPermissionDto, @RequestInfo() requestInfo: any) {
        //@@@ kiểm tra tồn tại
        await this.checkExistingFields(createNewPermissionDto.name, createNewPermissionDto.code);

        const createdPermission = await this.permissionService.create(createNewPermissionDto);
        if (createdPermission) {
            return this.responseService.createResponse(
                HttpStatus.CREATED,
                'Thêm mới thành công',
                requestInfo.requestId,
                requestInfo.at,
                createdPermission,
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
    @ApiOperation({ summary: 'Cập nhật quyền' })
    @UsePipes(new CustomValidationPipe())
    async update(
        @Param('id') id: number,
        @Body() updateOnePermissionDto: UpdatePermissionDto,
        @RequestInfo() requestInfo: any,
    ) {
        //@@@ kiểm tra tồn tại
        await this.checkExistingFields(updateOnePermissionDto.name, updateOnePermissionDto.code, id);

        const updateUser = await this.permissionService.update(id, updateOnePermissionDto);
        if (updateUser) {
            return this.responseService.createResponse(
                HttpStatus.OK,
                'Cập nhật thành công',
                requestInfo.requestId,
                requestInfo.at,
                updateUser,
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
    @ApiOperation({ summary: 'Xóa quyền' })
    async delete(@Param('id') id: number, @RequestInfo() requestInfo: any) {
        //handle error if user does not exist
        const user = await this.permissionService.findOne(id);
        if (!user) {
            return this.responseService.createResponse(
                HttpStatus.NOT_FOUND,
                'Quyền không tồn tại',
                requestInfo.requestId,
                requestInfo.at,
            );
        }
        await this.permissionService.delete(id);

        return this.responseService.createResponse(
            HttpStatus.OK,
            'Xóa quyền thành công',
            requestInfo.requestId,
            requestInfo.at,
        );
    }

    /**
     * checkExistingFields
     * @param username
     * @param email
     * @param idUpdate
     */
    async checkExistingFields(name: string, code: string, idUpdate: number = null) {
        const [existingName, existingCode] = await Promise.all([
            this.permissionService.findByField('name', name),
            this.permissionService.findByField('code', code),
        ]);

        const errors = {};
        if (existingName && (idUpdate === null || idUpdate != existingName.id)) {
            errors['name'] = 'Tên quyền đã tồn tại';
        }
        if (existingCode && (idUpdate === null || idUpdate != existingCode.id)) {
            errors['code'] = 'Mã quyền đã tồn tại';
        }

        if (Object.keys(errors).length > 0) {
            throw new ConflictException({
                message: [errors],
            });
        }
    }
}

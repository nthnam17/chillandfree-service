import {
    Controller,
    Get,
    Param,
    Delete,
    UseInterceptors,
    Query,
    UsePipes,
    Body,
    Post,
    Put,
    HttpStatus,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseService } from '../../../common/response/response.service';
import { LoggingInterceptor } from '../../../common/interceptors/logging.interceptor';
import { RequestInfo } from '../../../common/request-info.decorator';
import { RoleService } from './role.service';
import { FilterRoleDto } from './dto/filter-role.dto';
import { CreateNewsRoleDto } from './dto/create-new-role.dto';
import { CustomValidationPipe } from '../../../common/custom-validation-pipe';
import { UpdateOneRoleDto } from './dto/update-one-role.dto';

@ApiTags('Nhóm quyền')
@Controller('role')
@UseInterceptors(LoggingInterceptor)
export class RoleController {
    constructor(
        private readonly roleService: RoleService,
        private readonly responseService: ResponseService,
    ) {}

    //get all role
    @Get()
    @ApiOperation({ summary: 'Danh sách tất cả nhóm quyền' })
    async findAll(@Query() payload: FilterRoleDto, @RequestInfo() requestInfo: any) {
        const data = await this.roleService.findAll(payload);

        if (data) {
            return this.responseService.createResponse(
                200,
                'Lấy danh sách nhóm quyền thành công',
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
    @ApiOperation({ summary: 'Select nhóm quyền' })
    async findSelect(@RequestInfo() requestInfo: any) {
        const data = await this.roleService.findSelect();
        if (data) {
            return this.responseService.createResponse(
                HttpStatus.OK,
                'Lấy danh sách nhóm quyền thành công',
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
    @ApiOperation({ summary: 'Chi tiết nhóm quyền' })
    async findOne(@Param('id') id: number, @RequestInfo() requestInfo: any) {
        const user = await this.roleService.findOne(id);
        if (!user) {
            return this.responseService.createResponse(
                404,
                'Nhóm quyền không tồn tại',
                requestInfo.requestId,
                requestInfo.at,
            );
        }

        return this.responseService.createResponse(
            200,
            'Chi tiết nhóm quyền',
            requestInfo.requestId,
            requestInfo.at,
            user,
        );
    }

    @Post()
    @ApiOperation({ summary: 'Thêm mới nhóm quyền' })
    @UsePipes(new CustomValidationPipe())
    async create(@Body() createNewsRoleDto: CreateNewsRoleDto, @RequestInfo() requestInfo: any) {
        const createdData = await this.roleService.create(createNewsRoleDto);
        if (createdData) {
            return this.responseService.createResponse(
                201,
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
    @ApiOperation({ summary: 'Cập nhật nhóm quyền' })
    @UsePipes(new CustomValidationPipe())
    async update(@Param('id') id: number, @Body() updateRole: UpdateOneRoleDto, @RequestInfo() requestInfo: any) {
        const updateData = await this.roleService.update(id, updateRole);
        if (updateData) {
            return this.responseService.createResponse(
                HttpStatus.OK,
                'Cập nhật thành công',
                requestInfo.requestId,
                requestInfo.at,
                updateData,
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
    @ApiOperation({ summary: 'Xóa nhóm quyền' })
    async delete(@Param('id') id: number, @RequestInfo() requestInfo: any) {
        const user = await this.roleService.findOne(id);
        if (!user) {
            return this.responseService.createResponse(
                404,
                'Nhóm quyền không tồn tại',
                requestInfo.requestId,
                requestInfo.at,
            );
        }
        await this.roleService.delete(id);

        return this.responseService.createResponse(
            200,
            'Xóa nhóm quyền thành công',
            requestInfo.requestId,
            requestInfo.at,
        );
    }
}

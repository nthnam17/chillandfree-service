import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Delete,
    NotFoundException,
    UseInterceptors,
    Query,
    UsePipes,
    ConflictException,
    BadRequestException,
    UploadedFile,
    HttpStatus,
    InternalServerErrorException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { ResponseService } from '../../../common/response/response.service';
import { LoggingInterceptor } from '../../../common/interceptors/logging.interceptor';
import { RequestInfo } from '../../../common/request-info.decorator';
import { FilterUserDto } from './dto/filter-user.dto';
import { CreateNewsUserDto } from './dto/create-new-user.dto';
import { ResigerUserDto } from './dto/register-user.dto';
import { CustomValidationPipe } from '../../../common/custom-validation-pipe';
import { UpdateOneUserDto } from './dto/update-one-user.dto';
import { UpdatePassUserDto } from './dto/update-password-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { validateOrReject } from 'class-validator';

@ApiTags('Người dùng')
@Controller('users')
@UseInterceptors(LoggingInterceptor)
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly responseService: ResponseService,
    ) {}

    //get all users
    @Get()
    @ApiOperation({ summary: 'Danh sách tất cả người dùng' })
    async findAll(@Query() payload: FilterUserDto, @RequestInfo() requestInfo: any) {
        const data = await this.usersService.findAll(payload);
        if (data) {
            return this.responseService.createResponse(
                200,
                'Lấy danh sách người dùng thành công',
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
    @ApiOperation({ summary: 'Chi tiết người dùng' })
    async findOne(@Param('id') id: number, @RequestInfo() requestInfo: any) {
        const user = await this.usersService.findOne(id);
        if (!user) {
            return this.responseService.createResponse(
                404,
                'Người dùng không tồn tại',
                requestInfo.requestId,
                requestInfo.at,
            );
        }

        return this.responseService.createResponse(
            200,
            'Chi tiết người dùng',
            requestInfo.requestId,
            requestInfo.at,
            user,
        );
    }

    @Post()
    @ApiOperation({ summary: 'Thêm mới người dùng' })
    @UsePipes(new CustomValidationPipe())
    async create(@Body() createNewUserDto: CreateNewsUserDto, @RequestInfo() requestInfo: any) {
        //@@@ kiểm tra tồn tại
        await this.checkExistingFields(createNewUserDto.username, null);

        const createdUser = await this.usersService.create(createNewUserDto);
        if (createdUser) {
            return this.responseService.createResponse(
                201,
                'Thêm mới thành công',
                requestInfo.requestId,
                requestInfo.at,
                createdUser,
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

    // đăng ký người dùng
    @Post('register')
    @ApiOperation({ summary: 'Đăng ký người dùng' })
    @UsePipes(new CustomValidationPipe())
    async registerUser(@Body() resigerUserDto: ResigerUserDto, @RequestInfo() requestInfo: any) {
        //@@@ kiểm tra tồn tại
        await this.checkExistingFields(resigerUserDto.username, null);

        const createdUser = await this.usersService.registerUser(resigerUserDto);
        if (createdUser) {
            return this.responseService.createResponse(
                201,
                'Đăng ký thành công',
                requestInfo.requestId,
                requestInfo.at,
                createdUser,
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
    @ApiOperation({ summary: 'Cập nhật người dùng' })
    @UsePipes(new CustomValidationPipe())
    async update(@Param('id') id: number, @Body() updateOneUserDto: UpdateOneUserDto, @RequestInfo() requestInfo: any) {
        if ('username' in updateOneUserDto) {
            throw new BadRequestException('Không được phép cập nhật trường username');
        }
        if ('password' in updateOneUserDto) {
            throw new BadRequestException('Không được phép cập nhật trường password');
        }

        //@@@ kiểm tra tồn tại
        // await this.checkExistingFields(updateOneUserDto.email, updateOneUserDto.email, id);

        const updateUser = await this.usersService.update(id, updateOneUserDto);
        if (updateUser) {
            return this.responseService.createResponse(
                200,
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
    @ApiOperation({ summary: 'Xóa người dùng' })
    async delete(@Param('id') id: number, @RequestInfo() requestInfo: any) {
        //handle error if user does not exist
        const user = await this.usersService.findOne(id);
        if (!user) {
            return this.responseService.createResponse(
                404,
                'Người dùng không tồn tại',
                requestInfo.requestId,
                requestInfo.at,
            );
        }
        await this.usersService.delete(id);

        return this.responseService.createResponse(
            200,
            'Xóa người dùng thành công',
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
    async checkExistingFields(username: string, email: string, idUpdate: number = null) {
        const [existingUser, existingEmail] = await Promise.all([
            this.usersService.findByField('username', username),
            this.usersService.findByField('email', email),
        ]);

        const errors = {};
        if (existingUser && (idUpdate === null || idUpdate != existingUser.id)) {
            errors['username'] = 'Tài khoản đã tồn tại';
        }
        if (existingEmail && (idUpdate === null || idUpdate != existingEmail.id)) {
            errors['email'] = 'Email đã tồn tại';
        }

        if (Object.keys(errors).length > 0) {
            throw new ConflictException({
                message: [errors],
            });
        }
    }

    @Put('reset-password/:id')
    @ApiOperation({ summary: 'Cập nhật mật khẩu người dùng' })
    @UsePipes(new CustomValidationPipe())
    async resetPassUser(
        @Param('id') id: number,
        @Body() UpdatePassUserDto: UpdatePassUserDto,
        @RequestInfo() requestInfo: any,
    ) {
        const updatePassUser = await this.usersService.resetPassUser(id, UpdatePassUserDto);
        if (updatePassUser) {
            return this.responseService.createResponse(
                200,
                'reset mật khẩu thành công',
                requestInfo.requestId,
                requestInfo.at,
                updatePassUser,
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

    @Put('update-status/:id')
    @ApiOperation({ summary: 'Cập nhật trạng thái người dùng' })
    @UsePipes(new CustomValidationPipe())
    async updateStatusUser(@Param('id') id: number) {
        const updateStatusUser = await this.usersService.updateStatusUser(id);
        if (updateStatusUser) {
            return this.responseService.createResponse(
                200,
                'Cập nhật trạng thái người dùng thành công',
                null,
                null,
                updateStatusUser,
            );
        } else {
            return this.responseService.createResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                'Lỗi không xác định. Vui lòng thử lại sau',
                null,
                null,
            );
        }
    }
}

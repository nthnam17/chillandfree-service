import {
    Controller,
    Request,
    Post,
    UseGuards,
    Get,
    Headers,
    UnauthorizedException,
    Patch,
    Body,
    NotFoundException,
    HttpStatus,
    BadRequestException,
    Put,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { ResponseService } from '../common/response/response.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RequestInfo } from '../common/request-info.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from '../modules/cms/users/users.service';
import { ProfileDto } from './dto/profile.dto';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { JwtAuthGuard } from './passport/jwt-auth.guard';
import { Public } from './decorators/jwt.decorators';

@Controller()
export class AuthController {
    constructor(
        private authService: AuthService,
        private userService: UsersService,
        private responseService: ResponseService,
    ) {}

    @UseGuards(LocalAuthGuard)
    @Public()
    @Post('login')
    async handlelogin(@Request() req) {
        return this.authService.login(req.user);
    }

    @Get('profile')
    async getProfile(@Request() req) {
        const _requestId = uuidv4();
        const at = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        const user = await this.userService.findOne(req.user.id);

        const profile = new ProfileDto({
            id: user.id,
            role_id: user.role_id,
            username: user.username,
            email: user.email,
            image: user.image,
            name: user.name,
            status: user.status,
        });

        return this.responseService.createResponse(200, 'Lấy thông tin người dùng thành công', _requestId, at, profile);
    }

    @Put('change-password')
    async changePassword(@Body() changePasswordDto: ChangePasswordDto, @RequestInfo() requestInfo: any) {
        try {
            return this.responseService.createResponse(
                HttpStatus.OK,
                'Đổi mật khẩu thành công',
                requestInfo.requestId,
                requestInfo.at,
                await this.authService.changePassword(changePasswordDto),
            );
        } catch (error) {
            if (error instanceof NotFoundException) {
                return this.responseService.createResponse(
                    HttpStatus.NOT_FOUND,
                    error.message,
                    requestInfo.requestId,
                    requestInfo.at,
                );
            }
            if (error instanceof BadRequestException) {
                return this.responseService.createResponse(
                    HttpStatus.BAD_REQUEST,
                    error.message,
                    requestInfo.requestId,
                    requestInfo.at,
                );
            }

            return this.responseService.createResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                'Lỗi không xác định. Vui lòng thử lại sau',
                requestInfo.requestId,
                requestInfo.at,
            );
        }
    }

    @Put('update-profile')
    async updateProfile(@Body() updateProfileDto: UpdateProfileDto, @RequestInfo() requestInfo: any) {
        try {
            return this.responseService.createResponse(
                HttpStatus.OK,
                'Cập nhật thành công',
                requestInfo.requestId,
                requestInfo.at,
                await this.authService.updateProfile(updateProfileDto),
            );
        } catch (error) {
            if (error instanceof NotFoundException) {
                return this.responseService.createResponse(
                    HttpStatus.NOT_FOUND,
                    error.message,
                    requestInfo.requestId,
                    requestInfo.at,
                );
            }

            return this.responseService.createResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                'Lỗi không xác định. Vui lòng thử lại sau',
                requestInfo.requestId,
                requestInfo.at,
            );
        }
    }

    @Get('decode')
    decodeToken(@Headers('authorization') authHeader: string) {
        if (!authHeader) {
            throw new UnauthorizedException('Token không được cung cấp');
        }

        const token = authHeader.split(' ')[1];
        return this.authService.decodeToken(token);
    }
}

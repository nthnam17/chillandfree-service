import { BadRequestException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../modules/cms/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ResponseService } from '../common/response/response.service';
import { v4 as uuidv4 } from 'uuid';
import { ChangePasswordDto } from './dto/change-password.dto';
import { REQUEST } from '@nestjs/core';
import { CustomRequest } from '../interfaces/custom-request.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { Repository } from 'typeorm';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private jwtService: JwtService,
        private responseService: ResponseService,
        @Inject(REQUEST) private readonly request: CustomRequest,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}
    async validateUser(email: string, password: string): Promise<any> {

        const user = await this.usersService.findByField('email', email);

        const passwordValid = await bcrypt.compare(password, user.password);

        if (user && passwordValid) {
            return user;
        }
        return null;
    }
    async login(user: any) {
        const _requestId = uuidv4();
        const at = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        const payload = {username: user.email, sub: user.id}
        const access_token = this.jwtService.sign(payload, {
            expiresIn: process.env.JWT_EXPIRES_IN,
            secret: process.env.JWT_SECRET,
        });
        // return access_token;

        return this.responseService.createResponse(200, 'Đăng nhập thành công', _requestId, at, {
            access_token,
            expires_in: process.env.JWT_EXPIRES_IN,
            role: user.role_id
        });
    }

    async Profile(id: number) {
        const profile = this.userRepository.findOne({ where: {id} });
        return profile; 
    }

    decodeToken(token: string): any {
        try {
            const decoded = this.jwtService.verify(token, {
                secret: process.env.JWT_SECRET,
            });
            return decoded;
        } catch (error) {
            throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
        }
    }

    async changePassword(changePasswordDto: ChangePasswordDto) {
        const { currentPassword, newPassword } = changePasswordDto;
        const currentUser = this.request.user;

        const user = await this.usersService.findOne(currentUser?.id);
        if (!user) {
            throw new NotFoundException('Không tìm thấy người dùng');
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            throw new BadRequestException('Mật khẩu cũ không chính sác');
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
        await this.userRepository.save(user);
    }

    async updateProfile(updateProfileDto: UpdateProfileDto) {
        const { name, email, phone, image } = updateProfileDto;
        const currentUser = this.request.user;

        const user = await this.usersService.findOne(currentUser?.id);
        if (!user) {
            throw new NotFoundException('Không tìm thấy người dùng');
        }
        user.name = name;
        user.email = email;
        user.phone = phone;
        user.image = image;
        await this.userRepository.save(user);
    }
}

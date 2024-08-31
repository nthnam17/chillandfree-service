import { forwardRef, Module } from '@nestjs/common';
import { UsersModule } from '../modules/cms/users/users.module';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { UsersService } from '../modules/cms/users/users.service';
import { LocalStrategy } from './local.auth';
import { ResponseService } from '../common/response/response.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { JwtStrategy } from './passport/jwt.strategy';

@Module({
    imports: [
        UsersModule,
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
        }),
        TypeOrmModule.forFeature([User]),
    ],
    providers: [AuthService, UsersService, LocalStrategy, ResponseService,JwtStrategy],
    controllers: [AuthController],
})
export class AuthModule {}

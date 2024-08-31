import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../../entity/user.entity';
import { ResponseService } from '../../../common/response/response.service';

@Module({
    imports: [TypeOrmModule.forFeature([User]) ],
    controllers: [UsersController],
    providers: [UsersService, ResponseService],
    exports: [TypeOrmModule],
})
export class UsersModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponseService } from '../../../common/response/response.service';
import { Role } from '../../../entity/role.entity';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { RoleHasPermission } from '../../../entity/role_has_permission.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Role, RoleHasPermission]) ],
    controllers: [RoleController],
    providers: [RoleService, ResponseService],
    exports: [TypeOrmModule],
})
export class RoleModule {}

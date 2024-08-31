import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponseService } from '../../../common/response/response.service';
import { Permission } from '../../../entity/permission.entity';
import { PermissionController } from './permissions.controller';
import { PermissionService } from './permissions.service';
import { RoleHasPermissionModule } from '../role_has_permission/role_has_permission.module';

@Module({
    imports: [TypeOrmModule.forFeature([Permission]), RoleHasPermissionModule],
    controllers: [PermissionController],
    providers: [PermissionService, ResponseService],
    exports: [PermissionService],
})
export class PermissionModule {}

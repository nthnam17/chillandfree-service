import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleHasPermission } from '../../../entity/role_has_permission.entity';
import { RoleHasPermissionService } from './role_has_permission.service';

@Module({
    imports: [TypeOrmModule.forFeature([RoleHasPermission])],
    providers: [RoleHasPermissionService],
    exports: [RoleHasPermissionService],
})
export class RoleHasPermissionModule {}

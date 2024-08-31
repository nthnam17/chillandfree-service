import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionService } from '../../modules/cms/permissions/permissions.service';
import { RoleHasPermissionService } from '../../modules/cms/role_has_permission/role_has_permission.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private permissionService: PermissionService,
        private roleHasPermissionService: RoleHasPermissionService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.get<string[]>('permissions', context.getHandler());
        if (!requiredPermissions) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        const foundPermission = await this.permissionService.findByField('code', requiredPermissions.join(', '));
        if (!foundPermission) return false;

        const foundUser = await this.roleHasPermissionService.getPermissionByRoleId(user.role, foundPermission.id);
        if (!foundUser) return false;

        return true;
    }
}

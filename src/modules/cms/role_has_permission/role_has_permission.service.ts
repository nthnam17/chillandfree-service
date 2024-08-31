import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import logger from '../../../common/logger';
import { RoleHasPermission } from '../../../entity/role_has_permission.entity';
import { REQUEST } from '@nestjs/core';
import { Inject } from '@nestjs/common';
import { CustomRequest } from '../../../interfaces/custom-request.interface';

export class RoleHasPermissionService {
    constructor(
        @InjectRepository(RoleHasPermission)
        private roleHasRepository: Repository<RoleHasPermission>,
        @Inject(REQUEST) private readonly request: CustomRequest,
    ) {}

    async getPermissionByRoleId(roleId: number, permissionId: number) {
        try {
            return await this.roleHasRepository.findOne({ where: { role_id: roleId, permission_id: permissionId } });
        } catch (error) {
            logger.error('Lỗi khi lấy danh sách quyền theo nhóm quyền.');
            logger.error(error.stack);
            return null;
        }
    }

    async getLstPerByRoleId(roleId: number) {
        try {
            const query = this.roleHasRepository
                .createQueryBuilder('rhp')
                .leftJoin('permission', 'p', 'p.id = rhp.permission_id')
                .select(['p.code as code'])
                .where('rhp.role_id = :roleId', { roleId });
            // const queryStr = query.getQuery();
            // console.log(queryStr);
            return await query.getRawMany();
        } catch (error) {
            logger.error('Lỗi khi lấy danh sách quyền theo nhóm quyền.');
            logger.error(error.stack);
            return null;
        }
    }
}

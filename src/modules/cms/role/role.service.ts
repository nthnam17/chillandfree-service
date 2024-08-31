import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import logger from '../../../common/logger';
import { PageBase } from '../../../common/response/response-page-base';
import { CustomRequest } from '../../../interfaces/custom-request.interface';
import { Role } from '../../../entity/role.entity';
import { FilterRoleDto } from './dto/filter-role.dto';
import { RoleListDto } from './dto/list-role.dto';
import { CreateNewsRoleDto } from './dto/create-new-role.dto';
import { UpdateOneRoleDto } from './dto/update-one-role.dto';
import { RoleHasPermission } from '../../../entity/role_has_permission.entity';
import { RoleLog } from '../../../entity/role_log.entity';

@Injectable()
export class RoleService {
    constructor(
        @InjectRepository(Role)
        private roleRepository: Repository<Role>,
        @Inject(REQUEST) private readonly request: CustomRequest,
        @InjectRepository(RoleHasPermission)
        private roleHasPermissionRepository: Repository<RoleHasPermission>,
    ) {}

    async findAll(payload: FilterRoleDto) {
        try {
            const { name, status, pageIndex = 1, pageSize = 20, sort } = payload;

            const queryBuilder = this.roleRepository.createQueryBuilder('role').select(['role.*']);

            if (sort) {
                queryBuilder.orderBy(`role.${sort.field}`, sort.order.toUpperCase() as 'ASC' | 'DESC');
            } else {
                queryBuilder.orderBy(`role.id`, 'DESC');
            }

            if (name) queryBuilder.andWhere('role.name LIKE :name', { name: `%${name}%` });

            if (status) queryBuilder.andWhere('role.status = :status', { status });

            const [entities, totalItems] = await Promise.all([
                queryBuilder
                    .offset((pageIndex - 1) * pageSize)
                    .limit(pageSize)
                    .getRawMany(),
                queryBuilder.getCount(),
            ]);

            const role = entities.map((role) => new RoleListDto(role));

            const pageResult = new PageBase(pageIndex, pageSize, totalItems, role);
            return pageResult;
        } catch (error) {
            logger.error('Lỗi khi lấy danh sách nhóm quyền.');
            logger.error(error.stack);
            return null;
        }
    }

    async findOne(id: number) {
        try {
            const role = await this.roleRepository.findOne({
                where: { id },
                relations: ['roleHasPermissions', 'roleHasPermissions.permission'],
            });

            if (!role) {
                logger.error(`Không tìm thấy nhóm quyền với ID ${id}`);
                return null;
            }

            return {
                ...role,
                roleHasPermissions: role.roleHasPermissions.map((rp) => ({
                    id: rp.id,
                    role_id: rp.role_id,
                    permission_id: rp.permission_id,
                    permission: {
                        id: rp.permission.id,
                        name: rp.permission.name,
                        code: rp.permission.code,
                        slug: rp.permission.slug,
                        parent_id: rp.permission.parent_id,
                        status: rp.permission.status,
                        created_at: rp.permission.created_at,
                        updated_at: rp.permission.updated_at,
                        created_by: rp.permission.created_by,
                        updated_by: rp.permission.updated_by,
                    },
                })),
            };
        } catch (error) {
            logger.error('Lỗi lấy chi tiết nhóm quyền.');
            logger.error(error.stack);
            return null;
        }
    }

    async findSelect() {
        try {
            // Fetch all permissions in one query
            return await this.roleRepository
                .createQueryBuilder('r')
                .where('r.status = 1')
                .select(['r.id as id', 'r.name as name'])
                .orderBy('r.id', 'DESC')
                .getRawMany();
        } catch (error) {
            logger.error('Lỗi lấy danh sách select nhóm quyền.');
            logger.error(error.stack);
            return null;
        }
    }

    async create(createNewsRoleDto: CreateNewsRoleDto) {
        const queryRunner = this.roleRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const currentUser = this.request.user;

            const role = this.roleRepository.create({
                ...createNewsRoleDto,
                created_by: currentUser?.id,
                updated_by: currentUser?.id,
            });

            const savedRole = await this.roleRepository.save(role);

            if (createNewsRoleDto.permissions && createNewsRoleDto.permissions.length > 0) {
                const roleHasPermissions = createNewsRoleDto.permissions.map((permissionId) => {
                    const roleHasPermission = new RoleHasPermission();
                    roleHasPermission.role_id = savedRole.id;
                    roleHasPermission.permission_id = permissionId;
                    return roleHasPermission;
                });
                await this.roleHasPermissionRepository.save(roleHasPermissions);
            }

            //Ghi log
            const roleLog = new RoleLog();
            roleLog.action = `Nhóm quyền ${savedRole.name} được tạo mới`;
            roleLog.description = `Nhóm quyền được tạo mới bởi ID ${savedRole.id}`;
            roleLog.created_by = currentUser?.id;
            roleLog.created_at = new Date();

            await queryRunner.manager.save(roleLog);
            await queryRunner.commitTransaction();

            return savedRole;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            logger.error('Lỗi khi tạo mới nhóm quyền.');
            logger.error(error.stack);
            return null;
        } finally {
            await queryRunner.release();
        }
    }

    async update(id: number, updateOneRoleDto: UpdateOneRoleDto) {
        const queryRunner = this.roleRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const currentUser = this.request.user;
            const existingRole = await this.roleRepository.findOne({ where: { id } });
            if (!existingRole) {
                logger.error(`Không tìm thấy nhóm quyền với ID ${id}`);
                throw new NotFoundException(`Không tìm nhóm quyền với ID ${id}`);
            }

            const updatedRole = {
                ...existingRole,
                ...updateOneRoleDto,
                updated_by: currentUser?.id,
            };

            const savedRole = await this.roleRepository.save(updatedRole);

            if (updateOneRoleDto.permissions && updateOneRoleDto.permissions.length > 0) {
                await this.roleHasPermissionRepository.delete({ role_id: id });

                const roleHasPermissions = updateOneRoleDto.permissions.map((permissionId) => {
                    const roleHasPermission = new RoleHasPermission();
                    roleHasPermission.role_id = id;
                    roleHasPermission.permission_id = permissionId;
                    return roleHasPermission;
                });

                await this.roleHasPermissionRepository.save(roleHasPermissions);
            }

            // Ghi log
            const roleLog = new RoleLog();
            roleLog.action = `Cập nhật nhóm quyền ${savedRole.name}`;
            roleLog.description = `Nhóm quyền được cập nhật bởi ID ${savedRole.id}`;
            roleLog.created_by = currentUser?.id;
            roleLog.created_at = new Date();

            await queryRunner.manager.save(roleLog);
            await queryRunner.commitTransaction();

            return savedRole;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            if (error.name === 'QueryFailedError' && error.message.includes('invalid input syntax for type uuid')) {
                logger.error(`ID nhóm quyền "${id}" không hợp lệ.`);
            } else {
                logger.error('Lỗi khi cập nhật nhóm quyền.');
                logger.error(error.stack);
            }
            return null;
        } finally {
            await queryRunner.release();
        }
    }

    async delete(id: number) {
        try {
            await this.roleRepository.delete(id);
        } catch (error) {
            logger.error('Lỗi khi xóa nhóm quyền.');
            logger.error(error.stack);
            return null;
        }
    }
}

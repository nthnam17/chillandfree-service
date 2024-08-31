import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../../../entity/permission.entity';
import logger from '../../../common/logger';
import { PageBase } from '../../../common/response/response-page-base';
import { plainToClass } from 'class-transformer';
import { CreateNewsPermissionDto } from './dto/create-new-permission.dto';
import { CustomRequest } from '../../../interfaces/custom-request.interface';
import { UpdatePermissionDto } from './dto/update-one-permission.dto';
import { PermissionListDto } from './dto/permission-list.dto';

@Injectable({ scope: Scope.REQUEST })
export class PermissionService {
    constructor(
        @InjectRepository(Permission)
        private permissionRepository: Repository<Permission>,
        @Inject(REQUEST) private readonly request: CustomRequest,
    ) {}

    async findAll(payload: any) {
        try {
            const { name, pageIndex = 1, pageSize = 20, sort } = payload;

            const queryBuilder = this.permissionRepository.createQueryBuilder('permission');
            // .skip((pageIndex - 1) * pageSize)
            // .take(pageSize);

            if (sort) {
                queryBuilder.orderBy(`permission.${sort.field}`, sort.order.toUpperCase() as 'ASC' | 'DESC');
            } else {
                queryBuilder.orderBy(`permission.id`, 'DESC');
            }

            if (name) queryBuilder.andWhere('permission.name LIKE :name', { name: `%${name}%` });

            // const [entities, totalItems] = await queryBuilder.getManyAndCount();
            const entities = await queryBuilder.getMany();

            const permissions = entities.map((per) => new PermissionListDto(per));

            // Tạo cấu trúc cây từ danh sách các mục
            const dataMap = new Map<number, any>();
            permissions.forEach((per) => {
                dataMap.set(per.id, { ...per, children: [] });
            });

            const tree: any[] = [];

            dataMap.forEach((item) => {
                if (item.parent_id) {
                    const parent = dataMap.get(item.parent_id);
                    if (parent) {
                        parent.children.push(item);
                    }
                } else {
                    tree.push(item);
                }
            });

            const pageResult = new PageBase(pageIndex, pageSize, tree.length, tree);
            return pageResult;
        } catch (error) {
            logger.error('Lỗi khi lấy danh sách quyền.');
            logger.error(error.stack);
            return null;
        }
    }

    async findOne(id: number) {
        try {
            return await this.permissionRepository.findOne({ where: { id } });
        } catch (error) {
            logger.error('Lỗi lấy chi tiết quyền.');
            logger.error(error.stack);
            return null;
        }
    }

    async findByField(fieldName: string, value: string) {
        try {
            const queryBuilder = this.permissionRepository.createQueryBuilder('permission');
            queryBuilder.where(`permission.${fieldName} = :value`, { value });
            const entity = await queryBuilder.getOne();

            return entity;
        } catch (error) {
            logger.error('Lỗi lấy chi tiết quyền.');
            logger.error(error.stack);
            return null;
        }
    }

    async create(createNewPermissionDto: CreateNewsPermissionDto) {
        try {
            const currentUser = this.request.user;

            const permission = this.permissionRepository.create({
                ...createNewPermissionDto,
                created_by: currentUser?.id,
                updated_by: currentUser?.id,
            });
            const savedPermission = await this.permissionRepository.save(permission);

            return savedPermission;
        } catch (error) {
            logger.error('Lỗi khi tạo mới quyền.');
            logger.error(error.stack);
            return null;
        }
    }

    async findSelect() {
        try {
            // Fetch all permissions in one query
            const permissions = await this.permissionRepository
                .createQueryBuilder('permission')
                .where('permission.status = 1')
                .select(['permission.id as id', 'permission.name as name', 'permission.parent_id as parent_id'])
                .orderBy('permission.parent_id', 'ASC')
                .addOrderBy('permission.id', 'ASC')
                .getRawMany();

            // Separate parent and child permissions
            const parentPermissions = permissions.filter((permission) => !permission.parent_id);
            const childPermissions = permissions.filter((permission) => permission.parent_id);

            // Structure the permissions
            const structuredPermissions = parentPermissions.map((parent) => {
                const children = childPermissions
                    .filter((child) => child.parent_id === parent.id)
                    .map((child) => {
                        delete child.parent_id;
                        return child;
                    });

                return {
                    id: parent.id,
                    name: parent.name,
                    children,
                };
            });
            return structuredPermissions;
        } catch (error) {
            logger.error('Lỗi lấy danh sách select permission.');
            logger.error(error.stack);
            return null;
        }
    }

    async findSelectParent() {
        try {
            // Fetch all permissions in one query
            return await this.permissionRepository
                .createQueryBuilder('permission')
                .where('permission.status = 1')
                .andWhere('permission.parent_id is null')
                .select(['permission.id as id', 'permission.name as name'])
                .orderBy('permission.parent_id', 'ASC')
                .addOrderBy('permission.id', 'ASC')
                .getRawMany();
        } catch (error) {
            logger.error('Lỗi lấy danh sách select permission.');
            logger.error(error.stack);
            return null;
        }
    }

    async update(id: number, permissionDto: UpdatePermissionDto) {
        try {
            // Kiểm tra xem quyền có tồn tại không
            const permission = await this.permissionRepository.findOne({ where: { id } });
            if (!permission) {
                logger.error(`Không tìm thấy quyền với ID ${id}`);
                throw new NotFoundException(`Không tìm thấy quyền với ID ${id}`);
            }

            const currentUser = this.request.user;
            // Cập nhật thông tin quyền
            const updatedPermission = plainToClass(Permission, {
                ...permission,
                ...permissionDto,
                updated_by: currentUser?.id,
            });
            return await this.permissionRepository.save(updatedPermission);
        } catch (error) {
            if (error.name === 'QueryFailedError' && error.message.includes('invalid input syntax for type uuid')) {
                logger.error(`ID quyền "${id}" không hợp lệ.`);
            } else {
                logger.error('Lỗi khi cập nhật quyền.');
                logger.error(error.stack);
            }
            return null;
        }
    }

    async delete(id: number) {
        try {
            await this.permissionRepository.delete(id);
        } catch (error) {
            logger.error('Lỗi khi xóa quyền.');
            logger.error(error.stack);
            return null;
        }
    }
}

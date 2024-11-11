import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../../../entity/permission.entity';
import logger from '../../../common/logger';
import { PageBase } from '../../../common/response/response-page-base';
import { plainToClass } from 'class-transformer';
import { CustomRequest } from '../../../interfaces/custom-request.interface';
import { Categories } from '../../../entity/category.entity';
import { CategoriesListDto } from './dto/list.dto';

@Injectable({ scope: Scope.REQUEST })
export class CategoryService {
    constructor(
        @InjectRepository(Categories)
        private categoriesRepository: Repository<Categories>,
        @Inject(REQUEST) private readonly request: CustomRequest,
    ) {}

    async findAll(payload: any) {
        try {
            const { title,status, pageIndex = 1, pageSize = 20, sort } = payload;

            const queryBuilder = this.categoriesRepository.createQueryBuilder('categories');

            if (sort) {
                queryBuilder.orderBy(`categories.${sort.field}`, sort.order.toUpperCase() as 'ASC' | 'DESC');
            } else {
                queryBuilder.orderBy(`categories.position`, 'ASC');
            }

            if (title) queryBuilder.andWhere('categories.title LIKE :title', { title: `%${title}%` });

            if(status) queryBuilder.andWhere('categories.status = :status', { status: status });

            const entities = await queryBuilder.getMany();

            const categories = entities.map((cate) => new CategoriesListDto(cate));

            const pageResult = new PageBase(pageIndex, pageSize, categories.length, categories);
            return pageResult;
        } catch (error) {
            logger.error('Lỗi khi lấy danh sách danh mục.');
            logger.error(error.stack);
            return null;
        }
    }

    async findOne(id: number) {
        try {
            return await this.categoriesRepository.findOne({ where: { id } });
        } catch (error) {
            logger.error('Lỗi lấy chi tiết danh mục.');
            logger.error(error.stack);
            return null;
        }
    }

    async findByField(fieldName: string, value: string) {
        try {
            const queryBuilder = this.categoriesRepository.createQueryBuilder('categories');
            queryBuilder.where(`categories.${fieldName} = :value`, { value });
            const entity = await queryBuilder.getOne();

            return entity;
        } catch (error) {
            logger.error('Lỗi lấy chi tiết danh mục.');
            logger.error(error.stack);
            return null;
        }
    }

    async create(createNewDto: any) {
        try {
            const currentUser = this.request.user;

            const category = this.categoriesRepository.create({
                ...createNewDto,
                created_by: currentUser?.id,
                updated_by: currentUser?.id,
            });
            const savedPermission = await this.categoriesRepository.save(category);

            return savedPermission;
        } catch (error) {
            logger.error('Lỗi khi tạo mới danh mục.');
            logger.error(error.stack);
            return null;
        }
    }

    async findSelect() {
        try {
            const categories = await this.categoriesRepository
                .createQueryBuilder('categories')
                .where('categories.status = 1')
                .select(['categories.id as id', 'categories.title as title', 'categories.slug as slug'])
                .orderBy('categories.position', 'ASC')
                .addOrderBy('categories.id', 'ASC')
                .getRawMany();


            return categories;

        } catch (error) {
            logger.error('Lỗi lấy danh sách select danh mục.');
            logger.error(error.stack);
            return null;
        }
    }

    async update(id: number, updateOneDto: any) {
        try {
            const dataOne = await this.categoriesRepository.findOne({ where: { id } });
            if (!dataOne) {
                logger.error(`Không tìm thấy danh mục với ID ${id}`);
                throw new NotFoundException(`Không tìm thấy danh mục với ID ${id}`);
            }

            const currentUser = this.request.user;
            const updatedCategory = plainToClass(Permission, {
                ...dataOne,
                ...updateOneDto,
                updated_by: currentUser?.id,
            });
            return await this.categoriesRepository.save(updatedCategory);
        } catch (error) {
            if (error.name === 'QueryFailedError' && error.message.includes('invalid input syntax for type uuid')) {
                logger.error(`ID danh mục "${id}" không hợp lệ.`);
            } else {
                logger.error('Lỗi khi cập nhật danh mục.');
                logger.error(error.stack);
            }
            return null;
        }
    }

    async delete(id: number) {
        try {
            await this.categoriesRepository.delete(id);
        } catch (error) {
            logger.error('Lỗi khi xóa danh mục.');
            logger.error(error.stack);
            return null;
        }
    }
}

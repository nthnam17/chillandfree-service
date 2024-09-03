import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../../../entity/permission.entity';
import logger from '../../../common/logger';
import { PageBase } from '../../../common/response/response-page-base';
import { plainToClass } from 'class-transformer';
import { CustomRequest } from '../../../interfaces/custom-request.interface';
import { generateSlug } from '../../../utils/toslug.util';
import { CountryListDto } from './dto/list.dto';
import { Countries } from '../../../entity/countries.entity';

@Injectable({ scope: Scope.REQUEST })
export class CountryService {
    constructor(
        @InjectRepository(Countries)
        private countryRepository: Repository<Countries>,
        @Inject(REQUEST) private readonly request: CustomRequest,
    ) {}

    async findAll(payload: any) {
        try {
            const { title,status, pageIndex = 1, pageSize = 20, sort } = payload;

            const queryBuilder = this.countryRepository.createQueryBuilder('countries');
            queryBuilder.leftJoin('user','user1','user1.id = countries.created_by')
            .leftJoin('user','user2','user2.id = countries.updated_by')
            .select(['genres.*','user1.name as created_by','user2.name as updated_at'])

            if (sort) {
                queryBuilder.orderBy(`genres.${sort.field}`, sort.order.toUpperCase() as 'ASC' | 'DESC');
            } else {
                queryBuilder.orderBy(`genres.id`, 'DESC');
            }

            if (title) queryBuilder.andWhere('genres.title LIKE :title', { title: `%${title}%` });

            if(status) queryBuilder.andWhere('genres.status = :status', { status: status });

            const entities = await queryBuilder.getMany();

            const genres = entities.map((cate) => new CountryListDto(cate));

            const pageResult = new PageBase(pageIndex, pageSize, genres.length, genres);
            return pageResult;
        } catch (error) {
            logger.error('Lỗi khi lấy danh sách quốc gia.');
            logger.error(error.stack);
            return null;
        }
    }

    async findOne(id: number) {
        try {
            return await this.countryRepository.findOne({ where: { id } });
        } catch (error) {
            logger.error('Lỗi lấy chi tiết quốc gia.');
            logger.error(error.stack);
            return null;
        }
    }

    async findByField(fieldName: string, value: string) {
        try {
            const queryBuilder = this.countryRepository.createQueryBuilder('countries');
            queryBuilder.where(`countries.${fieldName} = :value`, { value });
            const entity = await queryBuilder.getOne();

            return entity;
        } catch (error) {
            logger.error('Lỗi lấy chi tiết quốc gia.');
            logger.error(error.stack);
            return null;
        }
    }

    async create(createNewDto: any) {
        try {
            const currentUser = this.request.user;

            const slug = generateSlug(createNewDto.title)

            const genre = this.countryRepository.create({
                ...createNewDto,
                slug: slug,
                created_by: currentUser?.id,
                updated_by: currentUser?.id,
            });
            const savedGenre = await this.countryRepository.save(genre);

            return savedGenre;
        } catch (error) {
            logger.error('Lỗi khi tạo mới quốc gia.');
            logger.error(error.stack);
            return null;
        }
    }

    async findSelect() {
        try {
            const countries = await this.countryRepository
                .createQueryBuilder('countries')
                .where('countries.status = 1')
                .select(['countries.id as id', 'countries.title as title', 'countries.slug as slug'])
                .addOrderBy('countries.id', 'ASC')
                .getRawMany();


            return countries;

        } catch (error) {
            logger.error('Lỗi lấy danh sách select quốc gia.');
            logger.error(error.stack);
            return null;
        }
    }

    async update(id: number, updateOneDto: any) {
        try {
            const dataOne = await this.countryRepository.findOne({ where: { id } });
            if (!dataOne) {
                logger.error(`Không tìm thấy quốc gia với ID ${id}`);
                throw new NotFoundException(`Không tìm thấy quốc gia với ID ${id}`);
            }

            const currentUser = this.request.user;
            const slug = generateSlug(updateOneDto.title)
            const updatedOne = plainToClass(Permission, {
                ...dataOne,
                ...updateOneDto,
                slug: slug,
                updated_by: currentUser?.id,
            });
            return await this.countryRepository.save(updatedOne);
        } catch (error) {
            if (error.name === 'QueryFailedError' && error.message.includes('invalid input syntax for type uuid')) {
                logger.error(`ID quốc gia "${id}" không hợp lệ.`);
            } else {
                logger.error('Lỗi khi cập nhật quốc gia.');
                logger.error(error.stack);
            }
            return null;
        }
    }

    async delete(id: number) {
        try {
            await this.countryRepository.delete(id);
        } catch (error) {
            logger.error('Lỗi khi xóa quốc gia.');
            logger.error(error.stack);
            return null;
        }
    }
}

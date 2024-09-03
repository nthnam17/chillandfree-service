import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../../../entity/permission.entity';
import logger from '../../../common/logger';
import { PageBase } from '../../../common/response/response-page-base';
import { plainToClass } from 'class-transformer';
import { CustomRequest } from '../../../interfaces/custom-request.interface';
import { Genres } from '../../../entity/genre.entity';
import { generateSlug } from '../../../utils/toslug.util';
import { GenreListDto } from './dto/list.dto';

@Injectable({ scope: Scope.REQUEST })
export class GenreService {
    constructor(
        @InjectRepository(Genres)
        private genresRepository: Repository<Genres>,
        @Inject(REQUEST) private readonly request: CustomRequest,
    ) {}

    async findAll(payload: any) {
        try {
            const { title,status, pageIndex = 1, pageSize = 20, sort } = payload;

            const queryBuilder = this.genresRepository.createQueryBuilder('genres');
            queryBuilder.leftJoin('user','user1','user1.id = genres.created_by')
            .leftJoin('user','user2','user2.id = genres.updated_by')
            .select(['genres.*','user1.name as created_by','user2.name as updated_at'])

            if (sort) {
                queryBuilder.orderBy(`genres.${sort.field}`, sort.order.toUpperCase() as 'ASC' | 'DESC');
            } else {
                queryBuilder.orderBy(`genres.id`, 'DESC');
            }

            if (title) queryBuilder.andWhere('genres.title LIKE :title', { title: `%${title}%` });

            if(status) queryBuilder.andWhere('genres.status = :status', { status: status });

            const entities = await queryBuilder.getMany();

            const genres = entities.map((cate) => new GenreListDto(cate));

            const pageResult = new PageBase(pageIndex, pageSize, genres.length, genres);
            return pageResult;
        } catch (error) {
            logger.error('Lỗi khi lấy danh sách thể loại.');
            logger.error(error.stack);
            return null;
        }
    }

    async findOne(id: number) {
        try {
            return await this.genresRepository.findOne({ where: { id } });
        } catch (error) {
            logger.error('Lỗi lấy chi tiết thể loại.');
            logger.error(error.stack);
            return null;
        }
    }

    async findByField(fieldName: string, value: string) {
        try {
            const queryBuilder = this.genresRepository.createQueryBuilder('genres');
            queryBuilder.where(`genres.${fieldName} = :value`, { value });
            const entity = await queryBuilder.getOne();

            return entity;
        } catch (error) {
            logger.error('Lỗi lấy chi tiết thể loại.');
            logger.error(error.stack);
            return null;
        }
    }

    async create(createNewDto: any) {
        try {
            const currentUser = this.request.user;

            const slug = generateSlug(createNewDto.title)

            const genre = this.genresRepository.create({
                ...createNewDto,
                slug: slug,
                created_by: currentUser?.id,
                updated_by: currentUser?.id,
            });
            const savedGenre = await this.genresRepository.save(genre);

            return savedGenre;
        } catch (error) {
            logger.error('Lỗi khi tạo mới thể loại.');
            logger.error(error.stack);
            return null;
        }
    }

    async findSelect() {
        try {
            const genres = await this.genresRepository
                .createQueryBuilder('genres')
                .where('genres.status = 1')
                .select(['genres.id as id', 'genres.title as title', 'genres.slug as slug'])
                .addOrderBy('genres.id', 'ASC')
                .getRawMany();


            return genres;

        } catch (error) {
            logger.error('Lỗi lấy danh sách select thể loại.');
            logger.error(error.stack);
            return null;
        }
    }

    async update(id: number, updateOneDto: any) {
        try {
            const dataOne = await this.genresRepository.findOne({ where: { id } });
            if (!dataOne) {
                logger.error(`Không tìm thấy thể loại với ID ${id}`);
                throw new NotFoundException(`Không tìm thấy thể loại với ID ${id}`);
            }

            const currentUser = this.request.user;
            const slug = generateSlug(updateOneDto.title)
            const updatedOne = plainToClass(Permission, {
                ...dataOne,
                ...updateOneDto,
                slug: slug,
                updated_by: currentUser?.id,
            });
            return await this.genresRepository.save(updatedOne);
        } catch (error) {
            if (error.name === 'QueryFailedError' && error.message.includes('invalid input syntax for type uuid')) {
                logger.error(`ID thể loại "${id}" không hợp lệ.`);
            } else {
                logger.error('Lỗi khi cập nhật thể loại.');
                logger.error(error.stack);
            }
            return null;
        }
    }

    async delete(id: number) {
        try {
            await this.genresRepository.delete(id);
        } catch (error) {
            logger.error('Lỗi khi xóa thể loại.');
            logger.error(error.stack);
            return null;
        }
    }
}

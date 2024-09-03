import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponseService } from '../../../common/response/response.service';
import { Genres } from '../../../entity/genre.entity';
import { GenreController } from './genre.controller';
import { GenreService } from './genre.service';

@Module({
    imports: [TypeOrmModule.forFeature([Genres])],
    controllers: [GenreController],
    providers: [GenreService, ResponseService],
    exports: [GenreService],
})
export class GenreModule {}

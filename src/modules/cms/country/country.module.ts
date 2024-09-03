import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponseService } from '../../../common/response/response.service';
import { Countries } from '../../../entity/countries.entity';
import { CountryController } from './country.controller';
import { CountryService } from './country.service';

@Module({
    imports: [TypeOrmModule.forFeature([Countries])],
    controllers: [CountryController],
    providers: [CountryService, ResponseService],
    exports: [CountryService],
})
export class CountryModule {}

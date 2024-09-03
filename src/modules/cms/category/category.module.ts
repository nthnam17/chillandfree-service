import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponseService } from '../../../common/response/response.service';
import { Permission } from '../../../entity/permission.entity';
import { RoleHasPermissionModule } from '../role_has_permission/role_has_permission.module';
import { Categories } from '../../../entity/category.entity';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

@Module({
    imports: [TypeOrmModule.forFeature([Categories])],
    controllers: [CategoryController],
    providers: [CategoryService, ResponseService],
    exports: [CategoryService],
})
export class CategoryModule {}

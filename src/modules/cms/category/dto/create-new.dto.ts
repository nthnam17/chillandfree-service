import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateNewsCategoryDto {
    @IsNotEmpty({ message: 'Tên không được để trống' })
    @ApiProperty()
    title: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    slug: string;

    @ApiProperty()
    position: number;

    @ApiProperty()
    status: number;
}
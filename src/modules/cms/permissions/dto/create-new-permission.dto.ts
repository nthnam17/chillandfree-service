import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateNewsPermissionDto {
    @IsNotEmpty({ message: 'Tên không được để trống' })
    @ApiProperty()
    name: string;

    @IsNotEmpty({ message: 'Mã không được để trống' })
    @ApiProperty()
    code: string;

    @ApiProperty()
    slug: string;

    @ApiProperty()
    parent_id: number;

    @ApiProperty()
    status: number;
}

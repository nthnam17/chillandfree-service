import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateOneRoleDto {
    @IsNotEmpty({ message: 'Tên không được để trống' })
    @ApiProperty()
    name: string;

    @ApiProperty()
    status: number;

    @ApiProperty()
    permissions: number[];
}

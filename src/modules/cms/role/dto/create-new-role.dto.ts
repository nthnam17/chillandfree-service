import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateNewsRoleDto {
    @IsNotEmpty({ message: 'Tên không được để trống' })
    @ApiProperty()
    name: string;

    @ApiProperty()
    status: number;

    @ApiProperty({ type: Number, isArray: true })
    permissions: number[];
}

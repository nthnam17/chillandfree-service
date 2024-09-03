import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateCountryDto {
    @IsNotEmpty({ message: 'Tên không được để trống' })
    @ApiProperty()
    title: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    position: number;

    @ApiProperty()
    status: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class UpdateOneUserDto {
    @IsNotEmpty({ message: 'Tên không được để trống' })
    @ApiProperty()
    name: string;

    // @IsEmail({}, { message: 'Định dạng Email không hợp lệ' })
    // @IsNotEmpty({ message: 'Email không được để trống' })
    @ApiProperty()
    email: string;

    @ApiProperty()
    phone: string;

    @ApiProperty()
    address: string;

    @ApiProperty()
    image: string;

    @ApiProperty()
    status: string;

    @ApiProperty()
    role_id: number;
}

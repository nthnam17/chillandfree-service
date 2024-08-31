import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateNewsUserDto {
    @IsNotEmpty({ message: 'Tên không được để trống' })
    @ApiProperty()
    name: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    phone: string;

    @ApiProperty()
    address: string;

    @ApiProperty()
    image: string;

    @IsNotEmpty({ message: 'Tài khoản không được để trống' })
    @ApiProperty()
    username: string;

    @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
    @ApiProperty()
    password: string;

    @ApiProperty()
    status: number;
  
    @ApiProperty()
    role_id: number;
}

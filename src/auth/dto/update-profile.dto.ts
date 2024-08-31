// src/users/dto/change-password.dto.ts
import { IsString, MinLength } from 'class-validator';

export class UpdateProfileDto {
    @IsString()
    name: string;

    @IsString()
    email: string;

    @IsString()
    phone: string;

    @IsString()
    image: string;
}

// profile.dto.ts
export class ProfileDto {
    id: number;
    email: string;
    role_id: number;
    username: string;
    image: string;
    name: string;
    lstPermission?: string[];
    status: number;

    constructor(partial: Partial<ProfileDto>) {
        Object.assign(this, partial);
    }
}

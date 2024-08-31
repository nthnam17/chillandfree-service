import { formatDateTime } from '../../../../utils/datetime.util';

export class UserListDto {
    id: number;
    name: string;
    username: string;
    status: string;
    image: string;
    role_id: number;
    role_name: string;
    created_at: string;
    updated_at: string;

    constructor(user: any) {
        this.id = user.id;
        this.name = user.name;
        this.username = user.username;
        this.status = user.status;
        this.image = user.image;
        this.role_id = user.role_id;
        this.role_name = user.role_name;
        this.created_at = user.created_at ? formatDateTime(user.created_at) : '';
        this.updated_at = user.updated_at ? formatDateTime(user.updated_at) : '';
    }
}

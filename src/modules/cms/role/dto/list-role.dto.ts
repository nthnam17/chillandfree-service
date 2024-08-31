import { formatDateTime } from '../../../../utils/datetime.util';

export class RoleListDto {
    id: number;
    name: string;
    status: number;
    created_by: number;
    updated_by: number;
    created_at: string;
    updated_at: string;

    constructor(role: any) {
        this.id = role.id ?? null;
        this.name = role.name ?? '';
        this.status = role.status ?? null;
        this.created_by = role.created_by ?? null;
        this.updated_by = role.updated_by ?? null;
        this.created_at = role.created_at ? formatDateTime(role.created_at) : '';
        this.updated_at = role.updated_at ? formatDateTime(role.updated_at) : '';
    }
}

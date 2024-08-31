import { formatDateTime } from '../../../../utils/datetime.util';

export class PermissionListDto {
    id: number;
    name: string;
    code: string;
    status: string;
    parent_id: number;
    created_at: string;
    updated_at: string;

    constructor(per: any) {
        this.id = per.id;
        this.name = per.name;
        this.code = per.code;
        this.status = per.status;
        this.parent_id = per.parent_id;
        this.created_at = per.created_at ? formatDateTime(per.created_at) : '';
        this.updated_at = per.updated_at ? formatDateTime(per.updated_at) : '';
    }
}

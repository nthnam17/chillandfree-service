import { formatDateTime } from '../../../../utils/datetime.util';

export class CategoriesListDto {
    id: number;
    title: string;
    slug: string;
    status: string;
    description: string;
    created_at: string;
    updated_at: string;
    created_by: string;
    updated_by: string;

    constructor(cate: any) {
        this.id = cate.id ?? '';
        this.title = cate.title ?? '';
        this.slug = cate.slug ?? '';
        this.status = cate.status ?? '';
        this.description = cate.description ?? '';
        this.created_by = cate.created_by ?? '';
        this.updated_by = cate.updated_by ?? '';
        this.updated_at = cate.updated_at ? formatDateTime(cate.updated_at) : '';
        this.updated_at = cate.updated_at ? formatDateTime(cate.updated_at) : '';
    }
}

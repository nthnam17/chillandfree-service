import { formatDateTime } from '../../../../utils/datetime.util';

export class GenreListDto {
    id: number;
    title: string;
    slug: string;
    status: string;
    created_at: string;
    updated_at: string;
    created_by: string;
    updated_by: string;

    constructor(genre: any) {
        this.id = genre.id ?? '';
        this.title = genre.title ?? '';
        this.slug = genre.slug ?? '';
        this.status = genre.status ?? '';
        this.created_by = genre.created_by ?? '';
        this.updated_by = genre.updated_by ?? '';
        this.updated_at = genre.updated_at ? formatDateTime(genre.updated_at) : '';
        this.updated_at = genre.updated_at ? formatDateTime(genre.updated_at) : '';
    }
}

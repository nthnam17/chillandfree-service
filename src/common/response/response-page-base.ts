export class PageBase<T> {
    constructor(pageIndex: number, pageSize: number, totalItems: number, items: T) {
        this.pageIndex = pageIndex;
        this.pageSize = pageSize;
        this.totalPages = Math.ceil(totalItems / pageSize);
        this.totalItems = totalItems;
        this.items = items;
    }

    pageIndex: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    items: T;
}

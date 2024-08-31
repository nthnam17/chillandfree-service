/**
 * @param date
 * @returns format HH:mm:ss DD/MM/YYYY
 */
export function formatDateTime(date: Date): string {
    return date.toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

/**
 * @param date
 * @returns format YYYY-MM-DD
 */
export function formatDate(date: Date): string {
    const _date = new Date(date);
    const year = _date.getFullYear();
    const month = ('0' + (_date.getMonth() + 1)).slice(-2);
    const day = ('0' + _date.getDate()).slice(-2);

    return `${year}-${month}-${day}`;
}

/**
 * @param date format YYYY-MM-DD
 * @returns format DD/MM/YYYY
 */
export function formatDate1(inputDate: string): string {
    const date = new Date(inputDate);

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Tháng bắt đầu từ 0
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}

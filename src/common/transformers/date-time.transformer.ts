import { ValueTransformer } from 'typeorm';

export const dateTimeTransformer: ValueTransformer = {
    to: (value: Date) => value,
    from: (value: any) => {
        if (value instanceof Date) {
            // Đảm bảo ngày giờ hiển thị đúng theo múi giờ Việt Nam
            return new Date(value.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
        } else if (typeof value === 'string') {
            // Chuyển đổi từ chuỗi ngày giờ thành đối tượng Date
            const date = new Date(value);
            return new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
        }
        return value;
    },
};

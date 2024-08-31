import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

const validFileExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

export const multerConfig: MulterOptions = {
    storage: diskStorage({
        destination: './uploads', // Thư mục lưu file
        filename: (req, file, cb) => {
            // Đổi tên file thành một tên duy nhất
            const uniqueSuffix = `${uuidv4()}${extname(file.originalname)}`;
            cb(null, uniqueSuffix);
        },
    }),
    fileFilter: (req, file, cb) => {
        const fileExt = extname(file.originalname).toLowerCase();
        const isValidExtension = validFileExtensions.includes(fileExt);
        const isValidMimeType = validMimeTypes.includes(file.mimetype);

        if (!isValidExtension || !isValidMimeType) {
            return cb(new Error('Unsupported file type'), false);
        }
        cb(null, true);
    },
    limits: {
        fileSize: 1024 * 1024 * 5, // Giới hạn kích thước file (5MB)
    },
};

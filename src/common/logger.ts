const DailyRotateFile = require('winston-daily-rotate-file');
import * as winston from 'winston';

const logger = winston.createLogger({
    transports: [
        new DailyRotateFile({
            filename: 'logs/%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
        }),
    ],
});

export default logger;

import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    BadRequestException,
    ConflictException,
    UnauthorizedException,
} from '@nestjs/common';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import logger from '../logger';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        request.requestId = uuidv4();
        request.at = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

        return next.handle().pipe(
            tap((data) => {
                // const objectString = JSON.stringify(data);
                // const message = `${objectString}`;
                // logger.info(message);
            }),
            catchError((error) => this.handleError(error, request)),
        );
    }

    private handleError(error: any, request: any): Observable<any> {
        switch (true) {
            case this.isBadRequest(error):
            case this.isConflictError(error):
                return this.handleClientError(error, request);
            default:
                this.logError(error);
                return throwError(error);
        }
    }

    private isBadRequest(error: any): boolean {
        return error instanceof BadRequestException;
    }

    private isConflictError(error: any): boolean {
        return error instanceof ConflictException;
    }

    private handleClientError(error: any, request: any): Observable<any> {
        const errorMessage = this.extractErrorMessage(error);
        const statusCode = error.getStatus();
        const requestId = request.requestId;
        const at = request.at;

        const result = {
            requestId,
            at,
            error: {
                message: errorMessage,
                statusCode,
            },
        };

        logger.error(JSON.stringify(result));
        return of(result);
    }

    private extractErrorMessage(error: any): string {
        const response = error.getResponse();
        return typeof response === 'object' && response !== null && 'message' in response
            ? response.message
            : 'Bad Request';
    }

    private logError(error: any): void {
        logger.error(error);
    }
}

import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { CustomRequest } from '../../../interfaces/custom-request.interface';

@Injectable({ scope: Scope.REQUEST })
export class UploadService {
    constructor() {}

    getFileLink(fileName: string): string {
        // Trả về đường link của file
        return `/uploads/${fileName}`;
    }
}

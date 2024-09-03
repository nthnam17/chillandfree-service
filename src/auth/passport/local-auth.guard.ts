import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LocalStrategy } from './local.auth';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
    constructor(private readonly localStrategy: LocalStrategy) {
        super();
    }
}

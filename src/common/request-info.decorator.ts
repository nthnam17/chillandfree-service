import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const RequestInfo = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return {
        requestId: request.requestId,
        at: request.at,
    };
});

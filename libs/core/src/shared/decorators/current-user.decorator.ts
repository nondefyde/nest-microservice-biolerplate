import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Auth } from '@shared/core/models';

export const extractUser = (request): Auth => request['user'];

export const CurrentUser = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return extractUser(request);
  },
);

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtTokenData } from 'src/types/base/auth.type';

export const AuthUser = createParamDecorator((data: keyof JwtTokenData | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user;

  return data ? user?.[data] : user;
});

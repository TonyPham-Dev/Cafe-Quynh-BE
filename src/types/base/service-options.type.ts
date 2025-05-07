import { Prisma } from '@prisma/client';
import { JwtTokenData } from './auth.type';
export type ServiceMethodOptions = {
  tx?: Prisma.TransactionClient;
  authUser?: JwtTokenData;
};

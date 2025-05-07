import { Prisma } from '@prisma/client';

export type RepositoryMethodOptions = {
  modelName?: string;
  tx?: Prisma.TransactionClient;
};

export type RepositoryFindManyOptions = {
  where?: any;
} & RepositoryMethodOptions;

export type RepositoryGetDetailOptions = {
  include?: any;
} & RepositoryMethodOptions;

export type RepositoryFindByIdOptions = {
  include?: any;
} & RepositoryMethodOptions;

export type RepositorySearchOptions = {
  filter?: any;
  search?: any;
  orderBy?: string;
  direction?: 'asc' | 'desc';
  include?: any;
} & RepositoryMethodOptions;

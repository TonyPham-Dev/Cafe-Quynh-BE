import { BaseFilterDto } from 'src/dtos/base/base-filter.dto';
import { PaginatedResponse } from 'src/dtos/base/pagination-response.dto';
import {
  RepositoryMethodOptions,
  RepositoryGetDetailOptions,
  RepositorySearchOptions,
  RepositoryFindManyOptions,
} from 'src/types/base/repository-options.type';
export interface ICrudRepository<T, CreateInput, UpdateInput> {
  create?(data: CreateInput, options?: RepositoryMethodOptions): Promise<T>;
  createMany?(data: CreateInput[], options?: RepositoryMethodOptions): Promise<void>;
  findMany?(options?: RepositoryFindManyOptions): Promise<T[]>;
  findById?(id: number, options?: RepositoryMethodOptions): Promise<T>;
  findByCode?(code: string, options?: RepositoryMethodOptions): Promise<T>;
  update?(id: number, data: UpdateInput, options?: RepositoryMethodOptions): Promise<T>;
  delete?(id: number, options?: RepositoryMethodOptions): Promise<void>;
  getDetail?(id: number, options?: RepositoryGetDetailOptions): Promise<any>;
  search?(query: BaseFilterDto, options?: RepositorySearchOptions): Promise<PaginatedResponse>;
  deleteMany?(ids: number[], options?: RepositoryMethodOptions): Promise<void>;
  generateCode?(data: T, options?: RepositoryMethodOptions): Promise<string | undefined>;
  transformSearchItem?(item: any): any;
}

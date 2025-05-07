import { BaseFilterDto } from 'src/dtos/base/base-filter.dto';
import { PaginatedResponse } from 'src/dtos/base/pagination-response.dto';
import { ServiceMethodOptions } from 'src/types/base/service-options.type';

export interface ICrudService<T, CreateDto, UpdateDto> {
  create(dto: CreateDto, options?: ServiceMethodOptions): Promise<T>;
  findMany?(): Promise<T[]>;
  findById?(id: number, options?: ServiceMethodOptions): Promise<T>;
  findByCode?(code: string, options?: ServiceMethodOptions): Promise<T>;
  update?(id: number, data: UpdateDto, options?: ServiceMethodOptions): Promise<any>;
  delete?(id: number, options?: ServiceMethodOptions): Promise<void>;
  getDetail?(id: number, options?: ServiceMethodOptions): Promise<any>;
  search?(query: BaseFilterDto, options?: ServiceMethodOptions): Promise<PaginatedResponse>;
  createMany?(dto: CreateDto[], options?: ServiceMethodOptions): Promise<void>;
  deleteMany?(ids: number[], options?: ServiceMethodOptions): Promise<void>;
  transformSearchItem?(item: any): any;
  transformDetail?(detail: any): any;
}

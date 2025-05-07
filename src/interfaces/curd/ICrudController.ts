import { BaseFilterDto } from 'src/dtos/base/base-filter.dto';
import { PaginatedResponse } from 'src/dtos/base/pagination-response.dto';
import { Response } from 'src/dtos/base/response.dto';
export interface ICrudController {
  create?(data: any, ...args: any[]): Promise<Response<any>>;
  findAll?(): Promise<Response<any>>;
  findById?(id: number, ...args: any[]): Promise<Response<any>>;
  update?(id: number, data: any, ...args: any[]): Promise<Response<any>>;
  delete?(id: number, ...args: any[]): Promise<Response<any>>;
  getDetail?(id: number, ...args: any[]): Promise<Response<any>>;
  search?(query: BaseFilterDto, ...args: any[]): Promise<Response<PaginatedResponse>>;
  deleteMany?(ids: number[]): Promise<any>;
}

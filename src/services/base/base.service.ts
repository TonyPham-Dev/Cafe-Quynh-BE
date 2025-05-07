import { ICrudService } from 'src/interfaces/curd/ICurdService';
import { ErrorCode } from 'src/types/base/error-code.type';
import { PaginatedResponse } from 'src/dtos/base/pagination-response.dto';
import { BaseFilterDto } from 'src/dtos/base/base-filter.dto';
import { Logger } from '@nestjs/common';
import { BaseCurdRepository } from 'src/repositories/base/base.repository';
import * as _ from 'lodash';
import { ServiceMethodOptions } from 'src/types/base/service-options.type';

export abstract class BaseCurdService<T, CreateDto, UpdateDto> implements ICrudService<T, CreateDto, UpdateDto> {
  protected readonly logger = new Logger(this.serviceName);

  constructor(
    protected readonly repository: BaseCurdRepository<T, any, any>,
    protected readonly serviceName: string,
  ) {}

  async create(dto: CreateDto, options?: ServiceMethodOptions): Promise<T> {
    try {
      return await this.repository.create(dto, {
        tx: options?.tx,
      });
    } catch (error) {
      console.log(error);
      throw new Error(ErrorCode.CREATE_FAILED);
    }
  }

  async createMany(dto: CreateDto[], options?: ServiceMethodOptions) {
    try {
      return await this.repository.createMany(dto, {
        tx: options?.tx,
      });
    } catch (error) {
      console.log(error);
      throw new Error(ErrorCode.CREATE_FAILED);
    }
  }

  async update(id: number, data: UpdateDto, options?: ServiceMethodOptions) {
    try {
      return await this.repository.update(id, data, {
        tx: options?.tx,
      });
    } catch (error) {
      console.log(error);
      throw new Error(ErrorCode.UPDATE_FAILED);
    }
  }

  async delete(id: number, options?: ServiceMethodOptions): Promise<void> {
    try {
      await this.repository.delete(id, {
        tx: options?.tx,
      });
    } catch (error) {
      console.log(error);
      throw new Error(ErrorCode.DELETE_FAILED);
    }
  }

  async deleteMany(ids: number[], options?: ServiceMethodOptions): Promise<void> {
    try {
      if (_.isEmpty(ids)) return;
      await this.repository.deleteMany(ids, {
        tx: options?.tx,
      });
    } catch (error) {
      console.log(error);
      throw new Error(ErrorCode.DELETE_FAILED);
    }
  }

  async findMany(options?: ServiceMethodOptions) {
    try {
      return await this.repository.findMany({
        tx: options?.tx,
      });
    } catch (error) {
      console.log(error);
      throw new Error(ErrorCode.GET_ALL_FAILED);
    }
  }

  async findById(id: number, options?: ServiceMethodOptions) {
    try {
      return await this.repository.findById(id, {
        tx: options?.tx,
      });
    } catch (error) {
      console.log(error);
      throw new Error(ErrorCode.NOT_FOUND);
    }
  }

  async findByCode(code: string, options?: ServiceMethodOptions) {
    try {
      return await this.repository.findByCode(code, {
        tx: options?.tx,
      });
    } catch (error) {
      console.log(error);
      throw new Error(ErrorCode.NOT_FOUND);
    }
  }

  async getDetail(id: number, options?: ServiceMethodOptions): Promise<any> {
    try {
      const detail = await this.repository.getDetail(id, {
        tx: options?.tx,
      });
      if (detail) {
        return this.transformDetail(detail);
      }
    } catch (error) {
      console.log(error);
      throw new Error(ErrorCode.NOT_FOUND);
    }
  }

  async search(dto: BaseFilterDto, options?: ServiceMethodOptions): Promise<PaginatedResponse> {
    try {
      const result = await this.repository.search(dto, {
        tx: options?.tx,
      });
      result.items = _.map(result.items, this.transformSearchItem);
      return result;
    } catch (error) {
      console.log(error);
      throw new Error(ErrorCode.SEARCH_FAILED);
    }
  }

  transformSearchItem(item: any) {
    return item;
  }

  transformDetail(detail: any) {
    return detail;
  }
}

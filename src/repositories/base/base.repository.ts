import { BaseFilterDto } from 'src/dtos/base/base-filter.dto';
import { PaginatedResponse } from 'src/dtos/base/pagination-response.dto';
import { PrismaService } from '../database/prisma.service';
import { ICrudRepository } from 'src/interfaces/curd/ICrudRepository';
import * as _ from 'lodash';
import { SEARCH_KEYWORD_CONFIG } from 'src/constants/search-fields.constant';
import {
  RepositoryFindByIdOptions,
  RepositoryFindManyOptions,
  RepositoryGetDetailOptions,
  RepositoryMethodOptions,
  RepositorySearchOptions,
} from 'src/types/base/repository-options.type';

export abstract class BaseCurdRepository<T, CreateInput, UpdateInput>
  implements ICrudRepository<T, CreateInput, UpdateInput>
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly modelName: string,
  ) {}

  async create(data: CreateInput, options?: RepositoryMethodOptions): Promise<T> {
    const modelName = options?.modelName || this.modelName;
    const prisma = options?.tx || this.prisma;
    const result = await prisma[modelName].create({
      data,
    });
    const code = await this.generateCode(result, options);

    if (code) {
      result.code = code;
    }

    return result;
  }

  async generateCode(data: T, options?: RepositoryMethodOptions) {
    return undefined;
  }

  async createMany(data: CreateInput[], options?: RepositoryMethodOptions): Promise<void> {
    const prisma = options?.tx || this.prisma;
    const modelName = options?.modelName || this.modelName;
    if (_.isEmpty(data)) return;
    await prisma[modelName].createMany({
      data,
    });
  }

  async update(id: number, data: UpdateInput, options?: RepositoryMethodOptions) {
    const prisma = options?.tx || this.prisma;
    const modelName = options?.modelName || this.modelName;
    return prisma[modelName].update({
      where: { id },
      data,
    });
  }

  async delete(id: number, options?: RepositoryMethodOptions): Promise<void> {
    const prisma = options?.tx || this.prisma;
    const modelName = options?.modelName || this.modelName;
    await prisma[modelName].delete({
      where: { id },
    });
  }

  async deleteMany(ids: number[], options?: RepositoryMethodOptions): Promise<void> {
    const prisma = options?.tx || this.prisma;
    const modelName = options?.modelName || this.modelName;
    await prisma[modelName].deleteMany({
      where: { id: { in: ids } },
    });
  }

  async findMany(options?: RepositoryFindManyOptions): Promise<T[]> {
    const prisma = options?.tx || this.prisma;
    const modelName = options?.modelName || this.modelName;
    return prisma[modelName].findMany({
      where: options?.where || undefined,
    });
  }

  async findById(id: number, options?: RepositoryFindByIdOptions): Promise<T> {
    const prisma = options?.tx || this.prisma;
    const modelName = options?.modelName || this.modelName;
    return prisma[modelName].findUniqueOrThrow({
      where: { id },
      include: options?.include || undefined,
    });
  }

  async findByCode(code: string, options?: RepositoryMethodOptions): Promise<T> {
    const prisma = options?.tx || this.prisma;
    const modelName = options?.modelName || this.modelName;
    return prisma[modelName].findUniqueOrThrow({
      where: { code },
    });
  }

  async getDetail(id: number, options?: RepositoryGetDetailOptions): Promise<any> {
    const prisma = options?.tx || this.prisma;
    const modelName = options?.modelName || this.modelName;
    return prisma[modelName].findUniqueOrThrow({
      where: { id },
      include: options?.include || undefined,
    });
  }

  async search(query: BaseFilterDto, options?: RepositorySearchOptions): Promise<PaginatedResponse> {
    const prisma = options?.tx || this.prisma;
    const modelName = options?.modelName || this.modelName;

    let { keyword, filter = {}, page = 1, limit = 10, orderBy, direction } = query;
    let where = {};
    const searchFields = SEARCH_KEYWORD_CONFIG[modelName];

    if (keyword && options?.search) {
      where = {
        ...where,
        ...options.search,
      };
    } else if (keyword && searchFields) {
      where['OR'] = searchFields.map(field => ({
        [field]: { contains: keyword, mode: 'insensitive' },
      }));
    }

    if (options?.filter) {
      where = {
        ...where,
        ...options.filter,
      };
    } else {
      for (const key in filter) {
        if (filter[key]) {
          where[key] = {
            [filter[key].operator]: filter[key].value,
          };
        }
      }
    }

    if (options?.orderBy) {
      orderBy = options.orderBy;
    }

    if (options?.direction) {
      direction = options.direction;
    }

    const [total, items] = await Promise.all([
      prisma[modelName].count({ where }),
      prisma[modelName].findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: orderBy ? { [orderBy]: direction } : undefined,
        include: options?.include || undefined,
      }),
    ]);

    const data = _.map(items, this.transformSearchItem);

    return {
      items: data,
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
    };
  }

  transformSearchItem(item: any) {
    return item;
  }
}

import { z } from 'zod';
import { FilterOperator } from '../../types/base/filter-operation.type';
import { createZodDto } from '@anatine/zod-nestjs';

export type FilterCondition = {
  operator: FilterOperator;
  value: any;
};

export type FilterOptions<T> = {
  [K in keyof T]?: FilterCondition;
};

export const FilterConditionSchema = z.object({
  operator: z.nativeEnum(FilterOperator),
  value: z.any(),
});

export const BaseFilterSchema = z.object({
  keyword: z.string().optional(),
  filter: z.record(z.string(), FilterConditionSchema).optional(),
  orderBy: z.string().optional().default('createdAt'),
  direction: z.enum(['asc', 'desc']).optional().default('desc'),
  limit: z.number().int().min(1).max(100).optional().default(10),
  page: z.number().int().min(1).optional().default(1),
});

export class BaseFilterDto extends createZodDto(BaseFilterSchema) {}

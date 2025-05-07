import { applyDecorators, Type } from '@nestjs/common';
import { ApiQuery, ApiQueryOptions } from '@nestjs/swagger';

export function MultiApiQuery<T extends Type<any>>(modelType: T) {
  const model = new modelType() as any;
  const defaultValues = modelType['default']?.() || {};

  const queryParams: ApiQueryOptions[] = Object.keys(model).map(key => ({
    name: key,
    required: false,
    type: typeof model[key],
    schema: {
      default: defaultValues[key],
      ...(typeof model[key] === 'object' ? { type: 'object', additionalProperties: true } : {}),
    },
  }));

  return applyDecorators(...queryParams.map(param => ApiQuery(param)));
}

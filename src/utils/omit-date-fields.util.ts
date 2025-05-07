import * as _ from 'lodash';

export const DATE_FIELDS = ['createdAt', 'updatedAt', 'deletedAt'] as const;
type DateFields = (typeof DATE_FIELDS)[number];

export function omitDateFields<T extends Record<string, any>>(obj: T): Omit<T, DateFields> {
  return _.omit(obj, DATE_FIELDS);
}

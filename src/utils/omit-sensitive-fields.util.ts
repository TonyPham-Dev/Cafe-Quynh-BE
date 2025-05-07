import * as _ from 'lodash';

export const SENSITIVE_FIELDS = [
  'password',
  'token',
  'refreshToken',
  'accessToken',
  'secretKey',
  'privateKey',
  'apiKey',
  'salt',
  'hash',
] as const;

type SensitiveFields = (typeof SENSITIVE_FIELDS)[number];

export function omitSensitiveFields<T extends Record<string, any>>(obj: T): Omit<T, SensitiveFields> {
  return _.omit(obj, SENSITIVE_FIELDS);
}

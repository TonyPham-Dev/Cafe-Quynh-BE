export const SEARCH_KEYWORD_CONFIG = {
  warehouse: ['code', 'name'],
} as const;

export type ModelName = keyof typeof SEARCH_KEYWORD_CONFIG;

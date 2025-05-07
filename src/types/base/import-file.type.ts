export type ImportFileMapping<T> = {
  [key: string]: keyof T;
};

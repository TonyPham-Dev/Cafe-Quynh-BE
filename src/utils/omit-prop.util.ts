export function omit<T extends Record<string, any>>(obj: T, keys: (keyof T)[]): Omit<T, keyof T> {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
}

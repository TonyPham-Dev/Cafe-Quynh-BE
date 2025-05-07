import { getRandomValues } from 'crypto';

export const generatorUniqueCode = () => getRandomValues(new Uint8Array(6)).join('').substring(0, 6);

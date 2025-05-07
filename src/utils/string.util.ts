import slugify from 'slugify';

export function removeDiacritics(str: string): string {
  const convertedString = slugify(str, {
    replacement: ' ',
    remove: undefined,
    lower: false,
    strict: true,
    locale: 'vi',
  });

  return convertedString;
}

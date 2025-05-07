const filter = {
  parse(filterProperty: any) {
    if (Array.isArray(filterProperty)) {
      return filterProperty.map((item: any) => this.parse(item));
    } else if (typeof filterProperty === 'object' && filterProperty !== null) {
      const out: any = {};
      Object.entries(filterProperty).forEach(([key, value]) => {
        if (key.startsWith('$')) {
          if (key === '$and') {
            out['AND'] = this.parse(value);
          } else if (key === '$or') {
            out['OR'] = this.parse(value);
          } else {
            out[key.slice(1)] = this.parse(value);
          }
        } else {
          out[key] = this.parse(value);
        }
      });
      return out;
    } else if (typeof filterProperty === 'string') {
      if (filterProperty.toLowerCase() === 'true') {
        return true;
      }
      if (filterProperty.toLowerCase() === 'false') {
        return false;
      }
      if (filterProperty.toLowerCase() === 'null') {
        return null;
      }
      if (!isNaN(Number(filterProperty)) && filterProperty.trim() !== '') {
        return Number(filterProperty);
      }
      return filterProperty;
    } else {
      return filterProperty;
    }
  },
  toFilterQueryString(obj: any, prefix = 'filter'): string {
    const parts: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = `${prefix}[${key}]`;

      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === 'object' && item !== null) {
            parts.push(this.toFilterQueryString(item, `${fullKey}[${index}]`));
          } else {
            parts.push(`${encodeURIComponent(fullKey)}[${index}]=${encodeURIComponent(item)}`);
          }
        });
      } else if (typeof value === 'object' && value !== null) {
        parts.push(this.toFilterQueryString(value, fullKey));
      } else {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          parts.push(`${encodeURIComponent(fullKey)}=${encodeURIComponent(value)}`);
        }
      }
    }

    return parts.join('&');
  },
};

export const apiHelper = {
  filter,
};

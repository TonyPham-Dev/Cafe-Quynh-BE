import * as _ from 'lodash';
import * as XLSX from 'xlsx';

export function exportFile<T>(
  data: T[],
  mapping: {
    [key in keyof T]: {
      columnName: string;
      dataType?: 'string' | 'number' | 'boolean' | 'date';
    };
  },
  fileType: 'csv' | 'xlsx' | 'xls' = 'csv',
) {
  const workbook = XLSX.utils.book_new();

  const sheet = XLSX.utils.json_to_sheet(
    data.map(sourceRow => {
      const exportRow = {} as Record<string, any>;
      for (const key in mapping) {
        const column = mapping[key];
        const dataType = column.dataType || 'string';
        if (dataType === 'number') {
          exportRow[column.columnName] = _.toNumber(sourceRow[key]);
        } else if (dataType === 'boolean') {
          exportRow[column.columnName] = !!sourceRow[key] ? 'true' : 'false';
        } else if (dataType === 'date') {
          exportRow[column.columnName] =
            sourceRow[key] instanceof Date
              ? sourceRow[key].toISOString().split('T')[0]
              : typeof sourceRow[key] === 'string' || typeof sourceRow[key] === 'number'
                ? new Date(sourceRow[key]).toISOString().split('T')[0]
                : '';
        } else {
          exportRow[column.columnName] = _.toString(sourceRow[key]);
        }
      }
      return exportRow;
    }),
  );

  XLSX.utils.book_append_sheet(workbook, sheet, 'Data');

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: fileType });
  // Add BOM for UTF-8
  const bom = Buffer.from([0xef, 0xbb, 0xbf]);
  return Buffer.concat([bom, buffer]);
}

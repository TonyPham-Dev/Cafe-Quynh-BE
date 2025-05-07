import * as XLSX from 'xlsx';
import { BadRequestException } from '@nestjs/common';
import * as _ from 'lodash';
import { ImportFileMapping } from 'src/types/base/import-file.type';

function excelDateToJSDate(serial) {
  if (!serial) {
    return undefined;
  }
  const utc_days = Math.floor(serial - 25569);
  const date_info = new Date(utc_days * 86400 * 1000);
  return date_info;
}

function convertValue(value: any, type: string): any {
  switch (type) {
    case 'number':
      return _.toNumber(value);
    case 'date':
      return excelDateToJSDate(value);
    case 'boolean':
      return value === 'true' || value === true;
    case 'string':
    default:
      return _.toString(value);
  }
}

export async function readData<T>(
  file: Express.Multer.File,
  columnMapping: ImportFileMapping<T>,
  typeMapping: { [key in keyof T]?: string } = {},
): Promise<T[]> {
  const fileExtension = file.originalname.split('.').pop();

  if (!_.includes(['xlsx', 'xls', 'csv'], fileExtension)) {
    throw new BadRequestException('File extension unsupported');
  }

  const results: T[] = [];

  const workbook = XLSX.read(file.buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  worksheet.forEach((row: any) => {
    const mappedRow = {} as T;
    for (const csvColumn in columnMapping) {
      const field = columnMapping[csvColumn];
      const fieldType = typeMapping ? typeMapping[field] : 'string';
      mappedRow[field] = convertValue(row[csvColumn], fieldType);
    }
    results.push(mappedRow);
  });

  return results;
}

import * as XLSX from 'xlsx';
import { BadRequestException } from '@nestjs/common';
import { ImportFileMapping } from 'src/types/base/import-file.type';
import { readData } from '../utils';

interface Product {
  field1: number;
  field2: string;
  field3: boolean;
}

describe('readData', () => {
  it('should read data and map it correctly', async () => {
    const mockFile = {
      originalname: 'test.xlsx',
      buffer: Buffer.from(''),
    } as Express.Multer.File;

    const mockMapping: ImportFileMapping<Product> = {
      Column1: 'field1',
      Column2: 'field2',
      Column3: 'field3',
    };

    const mockWorksheet = [
      { Column1: '123', Column2: 'test', Column3: 'true' },
      { Column1: '456', Column2: 'example', Column3: 'false' },
    ];

    jest.spyOn(XLSX, 'read').mockReturnValue({
      SheetNames: ['Sheet1'],
      Sheets: {
        Sheet1: XLSX.utils.json_to_sheet(mockWorksheet),
      },
    } as XLSX.WorkBook);

    const result = await readData<Product>(mockFile, mockMapping);

    expect(result).toEqual([
      { field1: 123, field2: 'test', field3: true },
      { field1: 456, field2: 'example', field3: false },
    ]);
  });

  it('should throw BadRequestException for unsupported file extension', async () => {
    const mockFile = {
      originalname: 'test.txt',
      buffer: Buffer.from(''),
    } as Express.Multer.File;

    const mockMapping: ImportFileMapping<Product> = {};

    await expect(readData(mockFile, mockMapping)).rejects.toThrow(BadRequestException);
  });
});

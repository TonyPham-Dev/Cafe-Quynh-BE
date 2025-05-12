import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';

export const CreateTableSchema = z.object({
  number: z.number().min(1),
  capacity: z.number().min(1),
});

export class CreateTableDto extends createZodDto(CreateTableSchema) {
  @ApiProperty({
    description: 'Table number',
    minimum: 1,
    example: 1
  })
  number: number;

  @ApiProperty({
    description: 'Table capacity (number of seats)',
    minimum: 1,
    example: 4
  })
  capacity: number;
} 
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';

export const UpdateTableSchema = z.object({
  number: z.number().min(1).optional(),
  capacity: z.number().min(1).optional(),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'RESERVED']).optional(),
});

export class UpdateTableDto extends createZodDto(UpdateTableSchema) {
  @ApiProperty({
    description: 'Table number',
    minimum: 1,
    required: false,
    example: 1
  })
  number?: number;

  @ApiProperty({
    description: 'Table capacity (number of seats)',
    minimum: 1,
    required: false,
    example: 4
  })
  capacity?: number;

  @ApiProperty({
    description: 'Table status',
    enum: ['AVAILABLE', 'OCCUPIED', 'RESERVED'],
    required: false,
    example: 'AVAILABLE'
  })
  status?: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
} 
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';

export const UpdateTableStatusSchema = z.object({
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'RESERVED']),
});

export class UpdateTableStatusDto extends createZodDto(UpdateTableStatusSchema) {
  @ApiProperty({
    description: 'Table status',
    enum: ['AVAILABLE', 'OCCUPIED', 'RESERVED'],
    example: 'AVAILABLE'
  })
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
} 
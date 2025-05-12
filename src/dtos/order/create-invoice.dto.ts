import { z } from 'zod';
import { PaymentMethod } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';

export const CreateInvoiceSchema = z.object({
  orderId: z.number(),
  paymentMethod: z.nativeEnum(PaymentMethod),
});

export class CreateInvoiceDto extends createZodDto(CreateInvoiceSchema) {
  @ApiProperty({
    description: 'Order ID',
    example: 1
  })
  orderId: number;

  @ApiProperty({
    description: 'Payment method',
    example: PaymentMethod.CASH
  })
  paymentMethod: PaymentMethod;
}


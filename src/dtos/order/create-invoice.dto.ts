import { z } from 'zod';
import { PaymentMethod } from '@prisma/client';

export const CreateInvoiceSchema = z.object({
  orderId: z.number(),
  paymentMethod: z.nativeEnum(PaymentMethod),
});

export type CreateInvoiceDto = z.infer<typeof CreateInvoiceSchema>; 
import { z } from 'zod';

export const OrderItemSchema = z.object({
  menuItemId: z.number(),
  quantity: z.number().min(1),
  notes: z.string().max(500).optional(),
});

export const CreateOrderSchema = z.object({
  tableId: z.number(),
  items: z.array(OrderItemSchema).min(1),
});

export type CreateOrderDto = z.infer<typeof CreateOrderSchema>;
export type OrderItemDto = z.infer<typeof OrderItemSchema>; 
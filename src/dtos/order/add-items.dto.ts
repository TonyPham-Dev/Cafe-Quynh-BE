import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const OrderItemSchema = z.object({
  menuItemId: z.number(),
  quantity: z.number().min(1),
  notes: z.string().max(500).optional(),
});

export const AddItemsSchema = z.object({
  items: z.array(OrderItemSchema).min(1),
});

export class AddItemsDto extends createZodDto(AddItemsSchema) {
  @ApiProperty({
    description: 'Items to add to the order',
    example: [{ menuItemId: 1, quantity: 1, notes: 'Extra spicy' }]
  })
  items: OrderItemDto[];
}

export class OrderItemDto extends createZodDto(OrderItemSchema) {
  @ApiProperty({
    description: 'Menu item ID',
    example: 1
  })
  menuItemId: number;

  @ApiProperty({
    description: 'Quantity',
    example: 1
  })
  quantity: number;

  @ApiProperty({
    description: 'Notes',
    example: 'Extra spicy'
  })
  notes?: string;
} 
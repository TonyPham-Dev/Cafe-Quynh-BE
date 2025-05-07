import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponse {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  totalPage: number;

  @ApiProperty({ description: 'Items' })
  items: any[];
}

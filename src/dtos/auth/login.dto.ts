import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const LoginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
});

export class LoginDto extends createZodDto(LoginSchema) {
  @ApiProperty({
    description: 'Username of the user',
    minLength: 3,
    maxLength: 50,
    example: 'johndoe'
  })
  username: string;

  @ApiProperty({
    description: 'Password of the user',
    minLength: 6,
    example: 'password123'
  })
  password: string;
}

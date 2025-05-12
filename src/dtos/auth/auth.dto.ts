import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const SignUpSchema = z.object({
  username: z
    .string({
      required_error: 'Username is required',
      invalid_type_error: 'Username must be a string',
    })
    .min(1, 'Username cannot be empty'),

  password: z
    .string({
      required_error: 'Password is required',
      invalid_type_error: 'Password must be a string',
    })
    .min(6, 'Password must be at least 6 characters'),
});

export class SignUpDto extends createZodDto(SignUpSchema) {
  @ApiProperty({
    description: 'Username of the user',
    minLength: 1,
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

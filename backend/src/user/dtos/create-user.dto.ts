/* eslint-disable @typescript-eslint/no-unsafe-return */

import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength,
  IsPhoneNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole } from 'generated/prisma';

export class CreateUserDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name must not exceed 50 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase().trim() : value,
  )
  email: string;

  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  phone?: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  // Only you should be admin, so role should default to USER for registrations
  @IsOptional()
  @IsEnum(UserRole, {
    message: `Role must be one of: ${Object.values(UserRole).join(', ')}`,
  })
  role?: UserRole;
}

export class CreateUserResponseDto {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    phone?: string;
    profileImage?: string;
  };
}
export class CreateUserResponseWithTokenDto {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    phone?: string;
    profileImage?: string;
  };
}

/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  password: string;
}

export class LoginResponseDto {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    profileImage?: string;
  };
}

export class LoginErrorResponseDto {
  statusCode: number;
  message: string;
  error: string;
}

export class LoginSuccessResponseDto {
  statusCode: number;
  message: string;
  data: LoginResponseDto;
}

export class LoginValidationErrorResponseDto {
  statusCode: number;
  message: string[];
  error: string;
}

export class LoginValidationErrorDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @IsString({ message: 'Password must be a string' })
  password?: string;
}

export class LoginValidationErrorResponse {
  statusCode: number;
  message: LoginValidationErrorDto;
  error: string;
}

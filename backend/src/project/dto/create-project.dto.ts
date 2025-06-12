import {
  IsNotEmpty,
  IsString,
  IsOptional,
  MaxLength,
  IsDateString,
} from 'class-validator';

export class CreateProjectDto {
  @IsString({ message: 'Project name must be a string' })
  @IsNotEmpty({ message: 'Project name is required' })
  @MaxLength(100, { message: 'Project name must not exceed 100 characters' })
  name: string;

  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;

  @IsDateString({}, { message: 'End date must be a valid date string' })
  @IsNotEmpty({ message: 'End date is required' })
  endDate: string;
}

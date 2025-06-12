import { IsOptional, IsString, MaxLength, IsDateString } from 'class-validator';

export class UpdateProjectDto {
  @IsOptional()
  @IsString({ message: 'Project name must be a string' })
  @MaxLength(100, { message: 'Project name must not exceed 100 characters' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;

  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid date string' })
  endDate?: string;
}

import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role, ProjectStatus, ProjectType } from '@prisma/client';

export class AdminUserQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'alex' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateUserStatusDto {
  @ApiProperty({ example: false })
  @IsBoolean()
  isActive: boolean;
}

export class AdminProjectQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ enum: ProjectStatus })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiPropertyOptional({ enum: ProjectType })
  @IsOptional()
  @IsEnum(ProjectType)
  type?: ProjectType;

  @ApiPropertyOptional({ example: 'AI' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class CreateHackathonDto {
  @ApiProperty({ example: 'Global Hackathon 2026' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: '48-hour buildathon for innovative AI systems.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2026-10-01T09:00:00Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-10-03T18:00:00Z' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: '2026-09-28T23:59:59Z' })
  @IsDateString()
  registrationDeadline: string;

  @ApiPropertyOptional({ example: 4, default: 4 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  maxTeamSize?: number;
}

export class AuditLogQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ example: 'uuid-user-id' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ example: 'USER_DEACTIVATED' })
  @IsOptional()
  @IsString()
  action?: string;
}

import {
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Max,
  IsString,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HackathonQueryDto {
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
  @Max(50)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Filter only active hackathons' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  active?: boolean;
}

export class RegisterHackathonDto {
  @ApiPropertyOptional({ example: 'uuid-team-id', description: 'Optional team ID to register with' })
  @IsOptional()
  @IsString()
  teamId?: string;
}

export class CreateHackathonDto {
  @ApiProperty({ example: 'HackMIT 2026' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Annual campus hackathon' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2026-11-01T09:00:00.000Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-11-03T18:00:00.000Z' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: '2026-10-25T23:59:59.000Z' })
  @IsDateString()
  registrationDeadline: string;

  @ApiPropertyOptional({ default: 4 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  maxTeamSize?: number = 4;
}

export class UpdateHackathonDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  registrationDeadline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  maxTeamSize?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CheckInDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  checkedIn: boolean;
}

export class AnnounceDto {
  @ApiProperty({ example: 'Hacking Begins!' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Submissions are officially open on the portal.' })
  @IsString()
  @IsNotEmpty()
  body: string;
}

export class ParticipantQueryDto {
  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  teamless?: boolean;

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
}

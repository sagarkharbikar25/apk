import {
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsArray,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus, ProjectType, ApplicationStatus } from '@prisma/client';

export class CreateProjectDto {
  @ApiProperty({ example: 'SkillSync AI Platform' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'An intelligent team-building and matchmaking platform for developers.' })
  @IsString()
  description: string;

  @ApiProperty({ enum: ProjectType, example: ProjectType.hackathon })
  @IsEnum(ProjectType)
  type: ProjectType;

  @ApiPropertyOptional({ example: 4, default: 4 })
  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(20)
  maxMembers?: number;

  @ApiPropertyOptional({
    example: ['uuid-skill-1', 'uuid-skill-2'],
    description: 'Array of Skill IDs required for this project',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredSkillIds?: string[];
}

export class UpdateProjectDto {
  @ApiPropertyOptional({ example: 'SkillSync AI Platform v2' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ProjectStatus, example: ProjectStatus.open })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiPropertyOptional({ enum: ProjectType, example: ProjectType.startup })
  @IsOptional()
  @IsEnum(ProjectType)
  type?: ProjectType;

  @ApiPropertyOptional({ example: 6 })
  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(20)
  maxMembers?: number;

  @ApiPropertyOptional({
    example: ['uuid-skill-1'],
    description: 'Array of Skill IDs to set as requirements',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredSkillIds?: string[];
}

export class ProjectQueryDto {
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

  @ApiPropertyOptional({ enum: ProjectStatus })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiPropertyOptional({ enum: ProjectType })
  @IsOptional()
  @IsEnum(ProjectType)
  type?: ProjectType;

  @ApiPropertyOptional({ example: 'React' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'uuid-of-skill' })
  @IsOptional()
  @IsString()
  skillId?: string;
}

export class ApplyProjectDto {
  @ApiPropertyOptional({ example: 'I have 3 years of experience in Flutter and backend.' })
  @IsOptional()
  @IsString()
  message?: string;
}

export class UpdateApplicationDto {
  @ApiProperty({ enum: ApplicationStatus, example: ApplicationStatus.accepted })
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;
}

export class InviteProjectMemberDto {
  @ApiProperty({ example: 'uuid-of-user-to-invite' })
  @IsString()
  @IsNotEmpty()
  inviteeId: string;

  @ApiPropertyOptional({ example: 'Frontend Lead' })
  @IsOptional()
  @IsString()
  role?: string;
}

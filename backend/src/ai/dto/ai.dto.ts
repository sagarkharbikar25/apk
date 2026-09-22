import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AnalyzeProjectDto {
  @ApiProperty({ example: 'SkillSync AI Matching Platform' })
  @IsString()
  @IsNotEmpty({ message: 'Project title cannot be empty' })
  title: string;

  @ApiProperty({
    example:
      'We are building an AI-powered developer team formation platform using Flutter for mobile, NestJS for the REST API, PostgreSQL with Prisma for data, and Gemini for skill matching.',
  })
  @IsString()
  @IsNotEmpty({ message: 'Project description cannot be empty' })
  description: string;
}

export class SkillGapDto {
  @ApiPropertyOptional({ example: 'uuid-project-id' })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({ example: ['React', 'Node.js', 'PostgreSQL', 'Docker'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetSkills?: string[];
}

export class RecommendationQueryDto {
  @ApiPropertyOptional({ example: 'uuid-of-project' })
  @IsOptional()
  @IsString()
  projectId?: string;
}

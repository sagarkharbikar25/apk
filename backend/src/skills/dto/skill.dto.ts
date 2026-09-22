import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SkillLevel } from '@prisma/client';

export class AddUserSkillDto {
  @ApiProperty({ example: 'uuid-of-skill' })
  @IsString()
  skillId: string;

  @ApiProperty({ enum: SkillLevel, example: SkillLevel.intermediate })
  @IsEnum(SkillLevel)
  level: SkillLevel;
}

export class SkillQueryDto {
  @ApiPropertyOptional({ example: 'Mobile' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'React' })
  @IsOptional()
  @IsString()
  search?: string;
}

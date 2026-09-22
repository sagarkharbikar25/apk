import { IsOptional, IsBoolean, IsInt, Min, Max, IsString } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

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

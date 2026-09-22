import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvitationStatus } from '@prisma/client';

export class CreateTeamDto {
  @ApiProperty({ example: 'AI Visionaries' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'uuid-project-id' })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({ example: 5, default: 5 })
  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(10)
  maxMembers?: number;
}

export class JoinTeamDto {
  @ApiPropertyOptional({
    description: 'QR Code token stored in Redis or team qrCode',
    example: 'uuid-qr-token',
  })
  @IsOptional()
  @IsString()
  qrToken?: string;
}

export class InviteMemberDto {
  @ApiProperty({ example: 'uuid-user-id' })
  @IsString()
  @IsNotEmpty()
  inviteeId: string;
}

export class RespondInvitationDto {
  @ApiProperty({ enum: [InvitationStatus.accepted, InvitationStatus.declined], example: InvitationStatus.accepted })
  @IsEnum(InvitationStatus)
  status: InvitationStatus;
}

export class TeamQueryDto {
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

  @ApiPropertyOptional({ example: 'uuid-project-id' })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({ example: 'Visionaries' })
  @IsOptional()
  @IsString()
  search?: string;
}

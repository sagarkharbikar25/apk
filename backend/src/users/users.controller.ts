import { Controller, Get, Patch, Body, Param, Post, Delete } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service.js';
import { SkillsService } from '../skills/skills.service.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { AddUserSkillDto } from '../skills/dto/skill.dto.js';
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

class UpdateProfileDto {
  @ApiPropertyOptional() @IsOptional() @IsString() bio?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() college?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() githubUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() linkedinUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() portfolioUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() location?: string;
}

class UpdateFcmTokenDto {
  @IsString() fcmToken: string;
}

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly skillsService: SkillsService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile + skills' })
  getMe(@CurrentUser('id') userId: string) {
    return this.usersService.getMe(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  updateMe(@CurrentUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateMe(userId, dto);
  }

  @Get(':id/profile')
  @ApiOperation({ summary: 'Get public profile of any user (Redis-cached)' })
  getProfile(@Param('id') id: string) {
    return this.usersService.getPublicProfile(id);
  }

  @Post('me/fcm-token')
  @ApiOperation({ summary: 'Register FCM push notification token' })
  saveFcmToken(@CurrentUser('id') userId: string, @Body() dto: UpdateFcmTokenDto) {
    return this.usersService.saveFcmToken(userId, dto.fcmToken);
  }

  @Post('me/skills')
  @ApiOperation({ summary: 'Add or update a skill for current user' })
  addUserSkill(@CurrentUser('id') userId: string, @Body() dto: AddUserSkillDto) {
    return this.skillsService.addUserSkill(userId, dto.skillId, dto.level);
  }

  @Delete('me/skills/:skillId')
  @ApiOperation({ summary: 'Remove a skill from current user' })
  removeUserSkill(
    @CurrentUser('id') userId: string,
    @Param('skillId') skillId: string,
  ) {
    return this.skillsService.removeUserSkill(userId, skillId);
  }
}

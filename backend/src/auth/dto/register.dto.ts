import { IsEmail, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'john@college.edu' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass1', minLength: 8 })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Password must contain at least 1 uppercase letter and 1 number',
  })
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2)
  displayName: string;

  @ApiProperty({ example: 'student', enum: ['student', 'organizer'], required: false })
  @IsString()
  role?: 'student' | 'organizer';

  @ApiProperty({ example: 'SKILLSYNC_ORG_2026', required: false })
  @IsString()
  organizerCode?: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'OldP@ss1',
    description: 'Current password',
  })
  @IsString()
  @MinLength(6)
  currentPassword: string;

  @ApiProperty({
    example: 'NewStr0ngP@ss',
    description: 'New password (minimum 6 characters)',
  })
  @IsString()
  @MinLength(6)
  newPassword: string;
}

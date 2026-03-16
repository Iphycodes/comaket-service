import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class DeleteAccountDto {
  @ApiProperty({
    example: 'StrongP@ss1',
    description: 'Current password for confirmation',
  })
  @IsString()
  @MinLength(6)
  password: string;
}

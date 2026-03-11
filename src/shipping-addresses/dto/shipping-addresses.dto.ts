import { IsString, IsOptional, IsBoolean, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateShippingAddressDto {
  @ApiProperty({ example: 'Ibrahim Musa' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: '09076141362' })
  @IsString()
  phoneNumber: string;

  @ApiPropertyOptional({ example: 'ibrahim@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'Murtala street' })
  @IsString()
  address: string;

  @ApiProperty({ example: 'Kano' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'Kano' })
  @IsString()
  state: string;

  @ApiPropertyOptional({ example: 'Nigeria' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: '700001' })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiPropertyOptional({ example: 'Home' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({
    description: 'Set as default address',
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateShippingAddressDto extends PartialType(
  CreateShippingAddressDto,
) {}

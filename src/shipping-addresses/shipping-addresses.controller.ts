import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ShippingAddressesService } from './shipping-addresses.service';

import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CreateShippingAddressDto, UpdateShippingAddressDto } from './dto/shipping-addresses.dto';

@ApiTags('Shipping Addresses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('shipping-addresses')
export class ShippingAddressesController {
  constructor(
    private readonly shippingAddressesService: ShippingAddressesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new shipping address' })
  async create(@Req() req: any, @Body() dto: CreateShippingAddressDto) {
    return this.shippingAddressesService.create(req.user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all shipping addresses for current user' })
  async findAll(@Req() req: any) {
    return this.shippingAddressesService.findAll(req.user.sub);
  }

  @Get('default')
  @ApiOperation({ summary: 'Get default shipping address' })
  async findDefault(@Req() req: any) {
    return this.shippingAddressesService.findDefault(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific shipping address' })
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.shippingAddressesService.findOne(req.user.sub, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a shipping address' })
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateShippingAddressDto,
  ) {
    return this.shippingAddressesService.update(req.user.sub, id, dto);
  }

  @Patch(':id/default')
  @ApiOperation({ summary: 'Set a shipping address as default' })
  async setDefault(@Req() req: any, @Param('id') id: string) {
    return this.shippingAddressesService.setDefault(req.user.sub, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a shipping address' })
  async remove(@Req() req: any, @Param('id') id: string) {
    await this.shippingAddressesService.remove(req.user.sub, id);
  }
}

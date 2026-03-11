/**
 * categories/categories.controller.ts - Category Endpoints
 * ===========================================================
 * ADMIN (create, update, delete):
 *   POST   /categories              → Create category
 *   PATCH  /categories/:id          → Update category
 *   DELETE /categories/:id          → Delete category
 *
 * PUBLIC (browse):
 *   GET    /categories              → All categories (flat)
 *   GET    /categories/tree         → Nested tree for menus
 *   GET    /categories/:slug        → Single category by slug
 *   GET    /categories/:id/children → Sub-categories
 */

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';

import { CategoriesService } from './categories.service';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@config/contants';
import { ResponseMessage } from '@common/decorators/response-message.decorator';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/categories.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // ═══════════════════════════════════════════════════════════
  // ADMIN ENDPOINTS
  // ═══════════════════════════════════════════════════════════

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.SuperAdmin)
  @ApiBearerAuth('JWT-auth')
  @ResponseMessage('Category created successfully')
  @ApiOperation({ summary: '[Admin] Create a category' })
  @ApiResponse({ status: 201, description: 'Category created' })
  async create(@Body() createDto: CreateCategoryDto) {
    return this.categoriesService.create(createDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.SuperAdmin)
  @ApiBearerAuth('JWT-auth')
  @ResponseMessage('Category updated successfully')
  @ApiOperation({ summary: '[Admin] Update a category' })
  @ApiParam({ name: 'id', description: 'Category MongoDB ID' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateCategoryDto) {
    return this.categoriesService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.SuperAdmin)
  @ApiBearerAuth('JWT-auth')
  @ResponseMessage('Category deleted successfully')
  @ApiOperation({ summary: '[Admin] Delete a category' })
  @ApiParam({ name: 'id', description: 'Category MongoDB ID' })
  async remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }

  // ═══════════════════════════════════════════════════════════
  // PUBLIC ENDPOINTS
  // ═══════════════════════════════════════════════════════════

  @Get()
  @ApiOperation({
    summary: 'Get all categories',
    description: 'Returns a flat list of all active categories',
  })
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get('tree')
  @ApiOperation({
    summary: 'Get category tree',
    description:
      'Returns categories in a nested tree structure for navigation menus',
  })
  async getTree() {
    return this.categoriesService.getTree();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get category by slug' })
  @ApiParam({ name: 'slug', example: 'fashion' })
  async findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  @Get(':id/children')
  @ApiOperation({ summary: 'Get sub-categories' })
  @ApiParam({ name: 'id', description: 'Parent category MongoDB ID' })
  async findChildren(@Param('id') id: string) {
    return this.categoriesService.findChildren(id);
  }
}
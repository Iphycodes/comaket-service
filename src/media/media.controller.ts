/**
 * media/media.controller.ts - Media Upload Endpoints
 * =====================================================
 * Two endpoints:
 *
 *   POST   /media/upload   → Upload a file and link it to an entity
 *   DELETE /media           → Remove a file from an entity
 *
 * HOW TO USE FROM FRONTEND (fetch/axios):
 *
 *   // Upload a listing image
 *   const formData = new FormData();
 *   formData.append('file', selectedFile);
 *   formData.append('entityType', 'listing');
 *   formData.append('entityId', '507f1f77bcf86cd799439011');
 *   formData.append('field', 'media');
 *
 *   const response = await fetch('/api/v1/media/upload', {
 *     method: 'POST',
 *     headers: { Authorization: `Bearer ${token}` },
 *     body: formData,  // Don't set Content-Type — browser sets it with boundary
 *   });
 *
 *   // Upload a creator logo
 *   const formData = new FormData();
 *   formData.append('file', logoFile);
 *   formData.append('entityType', 'creator');
 *   formData.append('entityId', creatorId);
 *   formData.append('field', 'logo');
 *
 * RESPONSE:
 *   {
 *     success: true,
 *     data: {
 *       url: "https://res.cloudinary.com/xxx/image/upload/v123/comaket/...",
 *       entityType: "listing",
 *       entityId: "507f1f77bcf86cd799439011",
 *       field: "media",
 *       message: "Image uploaded and linked to listing.media"
 *     }
 *   }
 *
 * After this, if you GET the listing, its media array will already
 * contain the uploaded image. No extra step needed.
 */

import {
  Body,
  Controller,
  Delete,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MediaService } from './media.service';
import { UploadMediaDto, DeleteMediaDto } from './dto/media.dto';
import { ResponseMessage } from '@common/decorators/response-message.decorator';
import { GetUser, JwtPayload } from '@common/decorators/get-user.decorator';

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  // ─── POST /api/v1/media/upload (single file) ────────────

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // Keep file in memory buffer (for Cloudinary stream)
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ResponseMessage('File uploaded successfully')
  @ApiOperation({
    summary: 'Upload and link a file',
    description:
      'Upload a file (image or video) and automatically attach it to an entity. ' +
      'The file is uploaded to Cloudinary and the entity field is updated immediately.\n\n' +
      'Entity → Field mapping:\n' +
      '- user: avatar\n' +
      '- creator: logo, coverImage, featuredWorks\n' +
      '- store: logo, coverImage\n' +
      '- listing: media\n' +
      '- category: icon, image (admin only)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'entityType', 'entityId', 'field'],
      properties: {
        file: { type: 'string', format: 'binary' },
        entityType: {
          type: 'string',
          enum: ['user', 'creator', 'store', 'listing', 'category'],
        },
        entityId: { type: 'string' },
        field: { type: 'string' },
        mediaType: {
          type: 'string',
          enum: ['image', 'video'],
          default: 'image',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded and linked to entity',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or entity/field combination',
  })
  @ApiResponse({ status: 403, description: 'Not the entity owner' })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadMediaDto,
    @GetUser() user: JwtPayload,
  ) {
    return this.mediaService.upload(file, dto, user.sub, user.role);
  }

  // ─── POST /api/v1/media/upload-multiple (up to 10 files) ──

  @Post('upload-multiple')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ResponseMessage('Files uploaded successfully')
  @ApiOperation({
    summary: 'Upload multiple files at once',
    description:
      'Upload up to 10 files and attach them all to the same entity. ' +
      'Ideal for listing media — upload all product images in one request.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['files', 'entityType', 'entityId', 'field'],
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
        entityType: {
          type: 'string',
          enum: ['user', 'creator', 'store', 'listing', 'category'],
        },
        entityId: { type: 'string' },
        field: { type: 'string' },
        mediaType: {
          type: 'string',
          enum: ['image', 'video'],
          default: 'image',
        },
      },
    },
  })
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: UploadMediaDto,
    @GetUser() user: JwtPayload,
  ) {
    const results = [];

    for (const file of files) {
      const result = await this.mediaService.upload(
        file,
        dto,
        user.sub,
        user.role,
      );
      results.push(result);
    }

    return {
      uploaded: results.length,
      files: results,
    };
  }

  // ─── POST /api/v1/media/upload-general (single file, no entity) ──

  @Post('upload-general')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ResponseMessage('File uploaded successfully')
  @ApiOperation({
    summary: 'Upload a file (no entity linking)',
    description:
      'Upload a file to Cloudinary and get back the URL. ' +
      'Use this when you need image URLs before creating an entity — ' +
      'e.g., uploading listing images before calling POST /listings.\n\n' +
      'Just send the file, no entityType/entityId/field needed.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, description: '{ url: "https://..." }' })
  async uploadGeneral(
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: JwtPayload,
  ) {
    return this.mediaService.uploadGeneral(file, user.sub);
  }

  // ─── POST /api/v1/media/upload-general-multiple (up to 10 files) ──

  @Post('upload-general-multiple')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ResponseMessage('Files uploaded successfully')
  @ApiOperation({
    summary: 'Upload multiple files (no entity linking)',
    description:
      'Upload up to 10 files and get back an array of URLs. ' +
      'Perfect for preparing listing images before creating the listing.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['files'],
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: '{ uploaded: 3, urls: [...] }' })
  async uploadGeneralMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @GetUser() user: JwtPayload,
  ) {
    return this.mediaService.uploadGeneralMultiple(files, user.sub);
  }

  // ─── DELETE /api/v1/media ───────────────────────────────

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ResponseMessage('File removed successfully')
  @ApiOperation({
    summary: 'Remove a file from an entity',
    description:
      'Removes an image from the entity field and deletes it from Cloudinary.\n\n' +
      'For single fields (avatar, logo): Sets the field to null.\n' +
      'For array fields (media): Removes the specific URL — you must provide imageUrl.',
  })
  @ApiResponse({ status: 200, description: 'File removed' })
  @ApiResponse({ status: 403, description: 'Not the entity owner' })
  async delete(@Body() dto: DeleteMediaDto, @GetUser() user: JwtPayload) {
    return this.mediaService.delete(dto, user.sub, user.role);
  }
}
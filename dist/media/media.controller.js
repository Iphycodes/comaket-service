"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const media_service_1 = require("./media.service");
const media_dto_1 = require("./dto/media.dto");
const response_message_decorator_1 = require("../common/decorators/response-message.decorator");
const get_user_decorator_1 = require("../common/decorators/get-user.decorator");
let MediaController = class MediaController {
    constructor(mediaService) {
        this.mediaService = mediaService;
    }
    async upload(file, dto, user) {
        return this.mediaService.upload(file, dto, user.sub, user.role);
    }
    async uploadMultiple(files, dto, user) {
        const results = [];
        for (const file of files) {
            const result = await this.mediaService.upload(file, dto, user.sub, user.role);
            results.push(result);
        }
        return {
            uploaded: results.length,
            files: results,
        };
    }
    async uploadGeneral(file, user) {
        return this.mediaService.uploadGeneral(file, user.sub);
    }
    async uploadGeneralMultiple(files, user) {
        return this.mediaService.uploadGeneralMultiple(files, user.sub);
    }
    async delete(dto, user) {
        return this.mediaService.delete(dto, user.sub, user.role);
    }
};
exports.MediaController = MediaController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: 10 * 1024 * 1024 },
    })),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, response_message_decorator_1.ResponseMessage)('File uploaded successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Upload and link a file',
        description: 'Upload a file (image or video) and automatically attach it to an entity. ' +
            'The file is uploaded to Cloudinary and the entity field is updated immediately.\n\n' +
            'Entity → Field mapping:\n' +
            '- user: avatar\n' +
            '- creator: logo, coverImage, featuredWorks\n' +
            '- store: logo, coverImage\n' +
            '- listing: media\n' +
            '- category: icon, image (admin only)',
    }),
    (0, swagger_1.ApiBody)({
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
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'File uploaded and linked to entity',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid file or entity/field combination',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Not the entity owner' }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, media_dto_1.UploadMediaDto, Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "upload", null);
__decorate([
    (0, common_1.Post)('upload-multiple'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10, {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: 10 * 1024 * 1024 },
    })),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, response_message_decorator_1.ResponseMessage)('Files uploaded successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Upload multiple files at once',
        description: 'Upload up to 10 files and attach them all to the same entity. ' +
            'Ideal for listing media — upload all product images in one request.',
    }),
    (0, swagger_1.ApiBody)({
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
    }),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, media_dto_1.UploadMediaDto, Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "uploadMultiple", null);
__decorate([
    (0, common_1.Post)('upload-general'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: 10 * 1024 * 1024 },
    })),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, response_message_decorator_1.ResponseMessage)('File uploaded successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Upload a file (no entity linking)',
        description: 'Upload a file to Cloudinary and get back the URL. ' +
            'Use this when you need image URLs before creating an entity — ' +
            'e.g., uploading listing images before calling POST /listings.\n\n' +
            'Just send the file, no entityType/entityId/field needed.',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['file'],
            properties: {
                file: { type: 'string', format: 'binary' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '{ url: "https://..." }' }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "uploadGeneral", null);
__decorate([
    (0, common_1.Post)('upload-general-multiple'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10, {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: 10 * 1024 * 1024 },
    })),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, response_message_decorator_1.ResponseMessage)('Files uploaded successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Upload multiple files (no entity linking)',
        description: 'Upload up to 10 files and get back an array of URLs. ' +
            'Perfect for preparing listing images before creating the listing.',
    }),
    (0, swagger_1.ApiBody)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '{ uploaded: 3, urls: [...] }' }),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "uploadGeneralMultiple", null);
__decorate([
    (0, common_1.Delete)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, response_message_decorator_1.ResponseMessage)('File removed successfully'),
    (0, swagger_1.ApiOperation)({
        summary: 'Remove a file from an entity',
        description: 'Removes an image from the entity field and deletes it from Cloudinary.\n\n' +
            'For single fields (avatar, logo): Sets the field to null.\n' +
            'For array fields (media): Removes the specific URL — you must provide imageUrl.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'File removed' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Not the entity owner' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [media_dto_1.DeleteMediaDto, Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "delete", null);
exports.MediaController = MediaController = __decorate([
    (0, swagger_1.ApiTags)('media'),
    (0, common_1.Controller)('media'),
    __metadata("design:paramtypes", [media_service_1.MediaService])
], MediaController);
//# sourceMappingURL=media.controller.js.map
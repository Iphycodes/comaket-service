import { MediaService } from './media.service';
import { UploadMediaDto, DeleteMediaDto } from './dto/media.dto';
import { JwtPayload } from '@common/decorators/get-user.decorator';
export declare class MediaController {
    private readonly mediaService;
    constructor(mediaService: MediaService);
    upload(file: Express.Multer.File, dto: UploadMediaDto, user: JwtPayload): Promise<{
        url: string;
        entityType: import("./dto/media.dto").EntityType;
        entityId: string;
        field: string;
        message: string;
    }>;
    uploadMultiple(files: Express.Multer.File[], dto: UploadMediaDto, user: JwtPayload): Promise<{
        uploaded: number;
        files: any[];
    }>;
    uploadGeneral(file: Express.Multer.File, user: JwtPayload): Promise<{
        url: string;
        message: string;
    }>;
    uploadGeneralMultiple(files: Express.Multer.File[], user: JwtPayload): Promise<{
        uploaded: number;
        urls: any[];
    }>;
    delete(dto: DeleteMediaDto, user: JwtPayload): Promise<{
        entityType: import("./dto/media.dto").EntityType;
        entityId: string;
        field: string;
        message: string;
    }>;
}

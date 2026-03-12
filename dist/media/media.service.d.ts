import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { UserDocument } from '../users/schemas/user.schema';
import { CreatorDocument } from '../creators/schemas/creator.schema';
import { StoreDocument } from '../stores/schemas/store.schema';
import { ListingDocument } from '../listings/schemas/listing.schema';
import { CategoryDocument } from '../categories/schema/categories.schema';
import { EntityType, UploadMediaDto, DeleteMediaDto } from './dto/media.dto';
export declare class MediaService {
    private configService;
    private userModel;
    private creatorModel;
    private storeModel;
    private listingModel;
    private categoryModel;
    private readonly logger;
    constructor(configService: ConfigService, userModel: Model<UserDocument>, creatorModel: Model<CreatorDocument>, storeModel: Model<StoreDocument>, listingModel: Model<ListingDocument>, categoryModel: Model<CategoryDocument>);
    upload(file: Express.Multer.File, dto: UploadMediaDto, userId: string, userRole: string): Promise<{
        url: string;
        entityType: EntityType;
        entityId: string;
        field: string;
        message: string;
    }>;
    uploadGeneral(file: Express.Multer.File, userId: string, folder?: string): Promise<{
        url: string;
        message: string;
    }>;
    uploadGeneralMultiple(files: Express.Multer.File[], userId: string, folder?: string): Promise<{
        uploaded: number;
        urls: any[];
    }>;
    delete(dto: DeleteMediaDto, userId: string, userRole: string): Promise<{
        entityType: EntityType;
        entityId: string;
        field: string;
        message: string;
    }>;
    private validateField;
    private validateFile;
    private verifyOwnership;
    private buildFolder;
    private uploadToCloudinary;
    private deleteFromCloudinary;
    private updateEntityField;
    private getFieldValue;
    private setFieldNull;
    private removeFromArrayField;
    private getModel;
}

import { Document, Types } from 'mongoose';
import { AlertType } from '../../config/contants';
import { BaseSchema } from '../../common/schemas/base-schema';
export type AlertDocument = Alert & Document;
export declare class Alert extends BaseSchema {
    userId: Types.ObjectId;
    type: AlertType;
    title: string;
    message: string;
    isRead: boolean;
    entityId?: Types.ObjectId;
    entityType?: 'order' | 'listing' | 'store' | 'dispute' | 'review' | 'user';
    metadata?: Record<string, any>;
}
export declare const AlertSchema: import("mongoose").Schema<Alert, import("mongoose").Model<Alert, any, any, any, Document<unknown, any, Alert> & Alert & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Alert, Document<unknown, {}, import("mongoose").FlatRecord<Alert>> & import("mongoose").FlatRecord<Alert> & {
    _id: Types.ObjectId;
}>;

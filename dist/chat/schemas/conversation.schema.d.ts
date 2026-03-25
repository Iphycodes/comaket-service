import { Document, Types } from 'mongoose';
export type ConversationDocument = Conversation & Document;
export declare class Conversation {
    participants: Types.ObjectId[];
    unreadCounts: Map<string, number>;
    lastMessage: {
        content: string;
        senderId: Types.ObjectId;
        type: string;
        createdAt: Date;
    } | null;
    productContext: {
        listingId: Types.ObjectId;
        itemName: string;
        price: number;
        image: string;
    } | null;
    participantDetails: Map<string, {
        displayName: string;
        avatar?: string;
        type?: 'user' | 'creator' | 'store';
        entityId?: string;
        username?: string;
    }>;
    contextType: string;
    isDeleted: boolean;
}
export declare const ConversationSchema: import("mongoose").Schema<Conversation, import("mongoose").Model<Conversation, any, any, any, Document<unknown, any, Conversation> & Conversation & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Conversation, Document<unknown, {}, import("mongoose").FlatRecord<Conversation>> & import("mongoose").FlatRecord<Conversation> & {
    _id: Types.ObjectId;
}>;

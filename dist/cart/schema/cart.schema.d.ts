import { BaseSchema } from '@common/schemas/base-schema';
import { Document, Types } from 'mongoose';
export declare class CartItem {
    listingId: Types.ObjectId;
    storeId: Types.ObjectId;
    quantity: number;
    itemName: string;
    unitPrice: number;
    currency: string;
    image?: string;
    type: string;
    sellerId: Types.ObjectId;
}
export declare const CartItemSchema: import("mongoose").Schema<CartItem, import("mongoose").Model<CartItem, any, any, any, Document<unknown, any, CartItem> & CartItem & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, CartItem, Document<unknown, {}, import("mongoose").FlatRecord<CartItem>> & import("mongoose").FlatRecord<CartItem> & {
    _id: Types.ObjectId;
}>;
export type CartDocument = Cart & Document;
export declare class Cart extends BaseSchema {
    userId: Types.ObjectId;
    items: CartItem[];
}
export declare const CartSchema: import("mongoose").Schema<Cart, import("mongoose").Model<Cart, any, any, any, Document<unknown, any, Cart> & Cart & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Cart, Document<unknown, {}, import("mongoose").FlatRecord<Cart>> & import("mongoose").FlatRecord<Cart> & {
    _id: Types.ObjectId;
}>;

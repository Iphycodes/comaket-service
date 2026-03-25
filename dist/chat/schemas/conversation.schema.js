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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationSchema = exports.Conversation = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Conversation = class Conversation {
};
exports.Conversation = Conversation;
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.Types.ObjectId, ref: 'User' }], required: true }),
    __metadata("design:type", Array)
], Conversation.prototype, "participants", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Map, of: Number, default: {} }),
    __metadata("design:type", Map)
], Conversation.prototype, "unreadCounts", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Object,
        default: undefined,
    }),
    __metadata("design:type", Object)
], Conversation.prototype, "lastMessage", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Object,
        default: undefined,
    }),
    __metadata("design:type", Object)
], Conversation.prototype, "productContext", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Map, of: Object, default: {} }),
    __metadata("design:type", Map)
], Conversation.prototype, "participantDetails", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ['creator', 'store', 'user'], default: 'user' }),
    __metadata("design:type", String)
], Conversation.prototype, "contextType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Conversation.prototype, "isDeleted", void 0);
exports.Conversation = Conversation = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], Conversation);
exports.ConversationSchema = mongoose_1.SchemaFactory.createForClass(Conversation);
exports.ConversationSchema.index({ participants: 1, updatedAt: -1 });
exports.ConversationSchema.index({ participants: 1 });
//# sourceMappingURL=conversation.schema.js.map
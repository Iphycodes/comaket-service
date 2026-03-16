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
exports.DisputeSchema = exports.Dispute = exports.DisputePriority = exports.DisputeStatus = exports.DisputeType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const base_schema_1 = require("../../common/schemas/base-schema");
var DisputeType;
(function (DisputeType) {
    DisputeType["OrderIssue"] = "order_issue";
    DisputeType["PaymentIssue"] = "payment_issue";
    DisputeType["ProductQuality"] = "product_quality";
    DisputeType["DeliveryIssue"] = "delivery_issue";
    DisputeType["SellerDispute"] = "seller_dispute";
    DisputeType["Other"] = "other";
})(DisputeType || (exports.DisputeType = DisputeType = {}));
var DisputeStatus;
(function (DisputeStatus) {
    DisputeStatus["Open"] = "open";
    DisputeStatus["UnderReview"] = "under_review";
    DisputeStatus["Resolved"] = "resolved";
    DisputeStatus["Closed"] = "closed";
})(DisputeStatus || (exports.DisputeStatus = DisputeStatus = {}));
var DisputePriority;
(function (DisputePriority) {
    DisputePriority["Low"] = "low";
    DisputePriority["Medium"] = "medium";
    DisputePriority["High"] = "high";
})(DisputePriority || (exports.DisputePriority = DisputePriority = {}));
class DisputeMessage {
}
let Dispute = class Dispute extends base_schema_1.BaseSchema {
};
exports.Dispute = Dispute;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Dispute.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Order', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Dispute.prototype, "orderId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: Object.values(DisputeType),
        required: true,
    }),
    __metadata("design:type", String)
], Dispute.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Dispute.prototype, "subject", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Dispute.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: Object.values(DisputeStatus),
        default: DisputeStatus.Open,
    }),
    __metadata("design:type", String)
], Dispute.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: Object.values(DisputePriority),
        default: DisputePriority.Medium,
    }),
    __metadata("design:type", String)
], Dispute.prototype, "priority", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", String)
], Dispute.prototype, "resolution", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Dispute.prototype, "attachments", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [
            {
                sender: { type: mongoose_2.Types.ObjectId, ref: 'User', required: true },
                message: { type: String, required: true },
                createdAt: { type: Date, default: Date.now },
            },
        ],
        default: [],
    }),
    __metadata("design:type", Array)
], Dispute.prototype, "messages", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Dispute.prototype, "assignedTo", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], Dispute.prototype, "resolvedAt", void 0);
exports.Dispute = Dispute = __decorate([
    (0, mongoose_1.Schema)({
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    })
], Dispute);
exports.DisputeSchema = mongoose_1.SchemaFactory.createForClass(Dispute);
exports.DisputeSchema.index({ userId: 1, status: 1 });
exports.DisputeSchema.index({ orderId: 1 });
exports.DisputeSchema.index({ status: 1, createdAt: -1 });
exports.DisputeSchema.index({ priority: 1, status: 1 });
exports.DisputeSchema.index({ assignedTo: 1, status: 1 });
exports.DisputeSchema.index({ type: 1, status: 1 });
//# sourceMappingURL=dispute.schema.js.map
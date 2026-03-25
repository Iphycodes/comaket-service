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
exports.AlertSchema = exports.Alert = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const contants_1 = require("../../config/contants");
const base_schema_1 = require("../../common/schemas/base-schema");
let Alert = class Alert extends base_schema_1.BaseSchema {
};
exports.Alert = Alert;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Alert.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: contants_1.AlertType, required: true }),
    __metadata("design:type", String)
], Alert.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Alert.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Alert.prototype, "message", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false, index: true }),
    __metadata("design:type", Boolean)
], Alert.prototype, "isRead", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Alert.prototype, "entityId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", String)
], Alert.prototype, "entityType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: null }),
    __metadata("design:type", Object)
], Alert.prototype, "metadata", void 0);
exports.Alert = Alert = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Alert);
exports.AlertSchema = mongoose_1.SchemaFactory.createForClass(Alert);
exports.AlertSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
exports.AlertSchema.index({ userId: 1, createdAt: -1 });
//# sourceMappingURL=alert.schema.js.map
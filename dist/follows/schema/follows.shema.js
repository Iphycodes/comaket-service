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
exports.FollowSchema = exports.Follow = exports.FollowTargetType = void 0;
const base_schema_1 = require("../../common/schemas/base-schema");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var FollowTargetType;
(function (FollowTargetType) {
    FollowTargetType["Creator"] = "creator";
    FollowTargetType["Store"] = "store";
})(FollowTargetType || (exports.FollowTargetType = FollowTargetType = {}));
let Follow = class Follow extends base_schema_1.BaseSchema {
};
exports.Follow = Follow;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Follow.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: Object.values(FollowTargetType), required: true }),
    __metadata("design:type", String)
], Follow.prototype, "targetType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Follow.prototype, "targetId", void 0);
exports.Follow = Follow = __decorate([
    (0, mongoose_1.Schema)({
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    })
], Follow);
exports.FollowSchema = mongoose_1.SchemaFactory.createForClass(Follow);
exports.FollowSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });
exports.FollowSchema.index({ userId: 1, createdAt: -1 });
exports.FollowSchema.index({ targetType: 1, targetId: 1 });
//# sourceMappingURL=follows.shema.js.map
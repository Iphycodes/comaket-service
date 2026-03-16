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
var DisputesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisputesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const dispute_schema_1 = require("./schemas/dispute.schema");
let DisputesService = DisputesService_1 = class DisputesService {
    constructor(disputeModel) {
        this.disputeModel = disputeModel;
        this.logger = new common_1.Logger(DisputesService_1.name);
    }
    async create(userId, dto) {
        const disputeData = {
            userId: new mongoose_2.Types.ObjectId(userId),
            type: dto.type,
            subject: dto.subject,
            description: dto.description,
        };
        if (dto.orderId) {
            disputeData.orderId = new mongoose_2.Types.ObjectId(dto.orderId);
        }
        if (dto.attachments?.length) {
            disputeData.attachments = dto.attachments;
        }
        const dispute = await this.disputeModel.create(disputeData);
        this.logger.log(`Dispute created by user ${userId}: ${dispute._id} (${dto.type})`);
        return dispute;
    }
    async findMyDisputes(userId, query) {
        const { page = 1, perPage = 20, sort = '-createdAt' } = query;
        const skip = (page - 1) * perPage;
        const filter = {
            userId: new mongoose_2.Types.ObjectId(userId),
            isDeleted: { $ne: true },
        };
        if (query.status)
            filter.status = query.status;
        if (query.type)
            filter.type = query.type;
        if (query.priority)
            filter.priority = query.priority;
        const [items, total] = await Promise.all([
            this.disputeModel
                .find(filter)
                .sort(sort)
                .skip(skip)
                .limit(perPage)
                .populate('orderId', 'orderNumber status totalAmount')
                .populate('assignedTo', 'firstName lastName email')
                .lean(),
            this.disputeModel.countDocuments(filter),
        ]);
        return {
            items,
            total,
            page,
            perPage,
            totalPages: Math.ceil(total / perPage),
        };
    }
    async findAll(query) {
        const { page = 1, perPage = 20, sort = '-createdAt', search } = query;
        const skip = (page - 1) * perPage;
        const filter = {
            isDeleted: { $ne: true },
        };
        if (query.status)
            filter.status = query.status;
        if (query.type)
            filter.type = query.type;
        if (query.priority)
            filter.priority = query.priority;
        if (search) {
            filter.$or = [
                { subject: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }
        const [items, total] = await Promise.all([
            this.disputeModel
                .find(filter)
                .sort(sort)
                .skip(skip)
                .limit(perPage)
                .populate('userId', 'firstName lastName email')
                .populate('orderId', 'orderNumber status totalAmount')
                .populate('assignedTo', 'firstName lastName email')
                .lean(),
            this.disputeModel.countDocuments(filter),
        ]);
        return {
            items,
            total,
            page,
            perPage,
            totalPages: Math.ceil(total / perPage),
        };
    }
    async findOne(id) {
        const dispute = await this.disputeModel
            .findOne({ _id: id, isDeleted: { $ne: true } })
            .populate('userId', 'firstName lastName email')
            .populate('orderId', 'orderNumber status totalAmount')
            .populate('assignedTo', 'firstName lastName email')
            .populate('messages.sender', 'firstName lastName email')
            .lean();
        if (!dispute) {
            throw new common_1.NotFoundException('Dispute not found');
        }
        return dispute;
    }
    async update(id, dto) {
        const dispute = await this.disputeModel.findOne({
            _id: id,
            isDeleted: { $ne: true },
        });
        if (!dispute) {
            throw new common_1.NotFoundException('Dispute not found');
        }
        if (dto.status)
            dispute.status = dto.status;
        if (dto.priority)
            dispute.priority = dto.priority;
        if (dto.resolution !== undefined)
            dispute.resolution = dto.resolution;
        if (dto.assignedTo) {
            dispute.assignedTo = new mongoose_2.Types.ObjectId(dto.assignedTo);
        }
        if (dto.status === dispute_schema_1.DisputeStatus.Resolved && !dispute.resolvedAt) {
            dispute.resolvedAt = new Date();
        }
        await dispute.save();
        this.logger.log(`Dispute ${id} updated: status=${dispute.status}`);
        return this.findOne(id);
    }
    async addMessage(id, userId, dto) {
        const dispute = await this.disputeModel.findOne({
            _id: id,
            isDeleted: { $ne: true },
        });
        if (!dispute) {
            throw new common_1.NotFoundException('Dispute not found');
        }
        dispute.messages.push({
            sender: new mongoose_2.Types.ObjectId(userId),
            message: dto.message,
            createdAt: new Date(),
        });
        await dispute.save();
        this.logger.log(`Message added to dispute ${id} by user ${userId}`);
        return this.findOne(id);
    }
    async getStats() {
        const results = await this.disputeModel.aggregate([
            { $match: { isDeleted: { $ne: true } } },
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);
        const stats = {
            open: 0,
            under_review: 0,
            resolved: 0,
            closed: 0,
            total: 0,
        };
        for (const result of results) {
            stats[result._id] = result.count;
            stats.total += result.count;
        }
        return stats;
    }
    async isOwner(disputeId, userId) {
        const dispute = await this.disputeModel
            .findOne({ _id: disputeId, isDeleted: { $ne: true } })
            .select('userId')
            .lean();
        if (!dispute) {
            throw new common_1.NotFoundException('Dispute not found');
        }
        return dispute.userId.toString() === userId;
    }
};
exports.DisputesService = DisputesService;
exports.DisputesService = DisputesService = DisputesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(dispute_schema_1.Dispute.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], DisputesService);
//# sourceMappingURL=disputes.service.js.map
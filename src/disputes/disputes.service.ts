/**
 * disputes/disputes.service.ts - Dispute Business Logic
 * ========================================================
 * Handles the entire dispute lifecycle:
 * - Creating disputes (user-facing)
 * - Querying disputes (user and admin views)
 * - Updating dispute status/resolution (admin)
 * - Adding messages to dispute threads (user and admin)
 * - Aggregating dispute stats (admin dashboard)
 */

import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Dispute,
  DisputeDocument,
  DisputeStatus,
} from './schemas/dispute.schema';
import {
  CreateDisputeDto,
  UpdateDisputeDto,
  AddDisputeMessageDto,
  QueryDisputesDto,
} from './dto/dispute.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';

@Injectable()
export class DisputesService {
  private readonly logger = new Logger(DisputesService.name);

  constructor(
    @InjectModel(Dispute.name) private disputeModel: Model<DisputeDocument>,
  ) {}

  // ─── Create Dispute ───────────────────────────────────────

  /**
   * POST /disputes
   *
   * Creates a new dispute for the authenticated user.
   * Optionally linked to an order.
   */
  async create(userId: string, dto: CreateDisputeDto): Promise<Dispute> {
    const disputeData: any = {
      userId: new Types.ObjectId(userId),
      type: dto.type,
      subject: dto.subject,
      description: dto.description,
    };

    if (dto.orderId) {
      disputeData.orderId = new Types.ObjectId(dto.orderId);
    }

    if (dto.attachments?.length) {
      disputeData.attachments = dto.attachments;
    }

    const dispute = await this.disputeModel.create(disputeData);

    this.logger.log(
      `Dispute created by user ${userId}: ${dispute._id} (${dto.type})`,
    );

    return dispute;
  }

  // ─── Find My Disputes ─────────────────────────────────────

  /**
   * GET /disputes/me
   *
   * Returns paginated disputes for the authenticated user.
   */
  async findMyDisputes(
    userId: string,
    query: QueryDisputesDto,
  ): Promise<PaginatedResponse<Dispute>> {
    const { page = 1, perPage = 20, sort = '-createdAt' } = query;
    const skip = (page - 1) * perPage;

    const filter: any = {
      userId: new Types.ObjectId(userId),
      isDeleted: { $ne: true },
    };

    if (query.status) filter.status = query.status;
    if (query.type) filter.type = query.type;
    if (query.priority) filter.priority = query.priority;

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

  // ─── Find All Disputes (Admin) ────────────────────────────

  /**
   * GET /disputes (Admin)
   *
   * Returns all disputes with optional filters. Paginated.
   */
  async findAll(
    query: QueryDisputesDto,
  ): Promise<PaginatedResponse<Dispute>> {
    const { page = 1, perPage = 20, sort = '-createdAt', search } = query;
    const skip = (page - 1) * perPage;

    const filter: any = {
      isDeleted: { $ne: true },
    };

    if (query.status) filter.status = query.status;
    if (query.type) filter.type = query.type;
    if (query.priority) filter.priority = query.priority;

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

  // ─── Find One Dispute ─────────────────────────────────────

  /**
   * GET /disputes/:id
   *
   * Returns a single dispute with full details.
   * Validates that the requester is the owner or an admin.
   */
  async findOne(id: string): Promise<Dispute> {
    const dispute = await this.disputeModel
      .findOne({ _id: id, isDeleted: { $ne: true } })
      .populate('userId', 'firstName lastName email')
      .populate('orderId', 'orderNumber status totalAmount')
      .populate('assignedTo', 'firstName lastName email')
      .populate('messages.sender', 'firstName lastName email')
      .lean();

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    return dispute;
  }

  // ─── Update Dispute (Admin) ───────────────────────────────

  /**
   * PATCH /disputes/:id (Admin)
   *
   * Updates dispute status, resolution, priority, or assignment.
   * If status is set to 'resolved', sets resolvedAt timestamp.
   */
  async update(id: string, dto: UpdateDisputeDto): Promise<Dispute> {
    const dispute = await this.disputeModel.findOne({
      _id: id,
      isDeleted: { $ne: true },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    if (dto.status) dispute.status = dto.status;
    if (dto.priority) dispute.priority = dto.priority;
    if (dto.resolution !== undefined) dispute.resolution = dto.resolution;

    if (dto.assignedTo) {
      dispute.assignedTo = new Types.ObjectId(dto.assignedTo);
    }

    // Set resolvedAt when dispute is resolved
    if (dto.status === DisputeStatus.Resolved && !dispute.resolvedAt) {
      dispute.resolvedAt = new Date();
    }

    await dispute.save();

    this.logger.log(`Dispute ${id} updated: status=${dispute.status}`);

    return this.findOne(id);
  }

  // ─── Add Message ──────────────────────────────────────────

  /**
   * POST /disputes/:id/messages
   *
   * Adds a message to the dispute thread.
   * Both the dispute owner and admins can add messages.
   */
  async addMessage(
    id: string,
    userId: string,
    dto: AddDisputeMessageDto,
  ): Promise<Dispute> {
    const dispute = await this.disputeModel.findOne({
      _id: id,
      isDeleted: { $ne: true },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    dispute.messages.push({
      sender: new Types.ObjectId(userId),
      message: dto.message,
      createdAt: new Date(),
    } as any);

    await dispute.save();

    this.logger.log(`Message added to dispute ${id} by user ${userId}`);

    return this.findOne(id);
  }

  // ─── Get Stats (Admin) ────────────────────────────────────

  /**
   * GET /disputes/stats (Admin)
   *
   * Returns dispute counts grouped by status.
   * Useful for admin dashboard widgets.
   */
  async getStats(): Promise<Record<string, number>> {
    const results = await this.disputeModel.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const stats: Record<string, number> = {
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

  // ─── Ownership Check Helper ───────────────────────────────

  /**
   * Checks if the user is the owner of the dispute.
   * Used by the controller to enforce access control.
   */
  async isOwner(disputeId: string, userId: string): Promise<boolean> {
    const dispute = await this.disputeModel
      .findOne({ _id: disputeId, isDeleted: { $ne: true } })
      .select('userId')
      .lean();

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    return dispute.userId.toString() === userId;
  }
}

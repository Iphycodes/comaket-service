import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Alert, AlertDocument } from './schemas/alert.schema';
import { AlertType } from '../config/contants';
import { GetAlertsDto } from './dto/alert.dto';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    @InjectModel(Alert.name) private readonly alertModel: Model<AlertDocument>,
  ) {}

  // ═══════════════════════════════════════════════════════════════════
  // CREATE ALERT — called internally from other services
  // ═══════════════════════════════════════════════════════════════════

  async createAlert(params: {
    userId: string | Types.ObjectId;
    type: AlertType;
    title: string;
    message: string;
    entityId?: string | Types.ObjectId;
    entityType?: 'order' | 'listing' | 'store' | 'dispute' | 'review' | 'user';
    metadata?: Record<string, any>;
  }): Promise<AlertDocument> {
    try {
      const alert = await this.alertModel.create({
        userId: new Types.ObjectId(String(params.userId)),
        type: params.type,
        title: params.title,
        message: params.message,
        entityId: params.entityId ? new Types.ObjectId(String(params.entityId)) : null,
        entityType: params.entityType || null,
        metadata: params.metadata || null,
      });
      this.logger.log(`Alert created: [${params.type}] for user ${params.userId}`);
      return alert;
    } catch (error) {
      this.logger.error(`Failed to create alert: ${error.message}`);
      throw error;
    }
  }

  // Convenience: create alerts for multiple users at once
  async createBulkAlerts(
    userIds: (string | Types.ObjectId)[],
    params: Omit<Parameters<AlertsService['createAlert']>[0], 'userId'>,
  ): Promise<void> {
    const docs = userIds.map((userId) => ({
      userId: new Types.ObjectId(String(userId)),
      type: params.type,
      title: params.title,
      message: params.message,
      entityId: params.entityId ? new Types.ObjectId(String(params.entityId)) : null,
      entityType: params.entityType || null,
      metadata: params.metadata || null,
    }));
    await this.alertModel.insertMany(docs);
    this.logger.log(`Bulk alerts created: [${params.type}] for ${userIds.length} users`);
  }

  // ═══════════════════════════════════════════════════════════════════
  // READ
  // ═══════════════════════════════════════════════════════════════════

  async getAlerts(userId: string, dto: GetAlertsDto) {
    const { page = 1, perPage = 20, isRead, type } = dto;
    const filter: Record<string, any> = {
      userId: new Types.ObjectId(userId),
      isDeleted: { $ne: true },
    };

    if (isRead === 'true') filter.isRead = true;
    if (isRead === 'false') filter.isRead = false;
    if (type) filter.type = type;

    const [alerts, total] = await Promise.all([
      this.alertModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .lean()
        .exec(),
      this.alertModel.countDocuments(filter).exec(),
    ]);

    return {
      data: alerts,
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.alertModel.countDocuments({
      userId: new Types.ObjectId(userId),
      isRead: false,
      isDeleted: { $ne: true },
    }).exec();
  }

  // ═══════════════════════════════════════════════════════════════════
  // UPDATE
  // ═══════════════════════════════════════════════════════════════════

  async markAsRead(alertId: string, userId: string): Promise<AlertDocument | null> {
    return this.alertModel.findOneAndUpdate(
      { _id: new Types.ObjectId(alertId), userId: new Types.ObjectId(userId) },
      { isRead: true },
      { new: true },
    ).exec();
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.alertModel.updateMany(
      { userId: new Types.ObjectId(userId), isRead: false },
      { isRead: true },
    ).exec();
    return result.modifiedCount;
  }

  // ═══════════════════════════════════════════════════════════════════
  // DELETE
  // ═══════════════════════════════════════════════════════════════════

  async deleteAlert(alertId: string, userId: string): Promise<boolean> {
    const result = await this.alertModel.findOneAndUpdate(
      { _id: new Types.ObjectId(alertId), userId: new Types.ObjectId(userId) },
      { isDeleted: true, deletedAt: new Date() },
    ).exec();
    return !!result;
  }

  async clearAllAlerts(userId: string): Promise<number> {
    const result = await this.alertModel.updateMany(
      { userId: new Types.ObjectId(userId), isDeleted: { $ne: true } },
      { isDeleted: true, deletedAt: new Date() },
    ).exec();
    return result.modifiedCount;
  }
}

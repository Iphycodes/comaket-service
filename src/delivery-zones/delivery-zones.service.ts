import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  DeliveryZone,
  DeliveryZoneDocument,
} from './schemas/delivery-zone.schema';
import {
  CreateDeliveryZoneDto,
  UpdateDeliveryZoneDto,
} from './dto/delivery-zone.dto';

@Injectable()
export class DeliveryZonesService {
  constructor(
    @InjectModel(DeliveryZone.name)
    private readonly zoneModel: Model<DeliveryZoneDocument>,
  ) {}

  // ─── Admin CRUD ──────────────────────────────────────────────

  async create(dto: CreateDeliveryZoneDto): Promise<DeliveryZoneDocument> {
    const existing = await this.zoneModel
      .findOne({ name: dto.name, isDeleted: { $ne: true } })
      .exec();
    if (existing) {
      throw new ConflictException(`Zone "${dto.name}" already exists`);
    }
    return this.zoneModel.create(dto);
  }

  async findAll(): Promise<DeliveryZoneDocument[]> {
    return this.zoneModel
      .find({ isDeleted: { $ne: true } })
      .sort({ name: 1 })
      .exec();
  }

  async findActive(): Promise<DeliveryZoneDocument[]> {
    return this.zoneModel
      .find({ isActive: true, isDeleted: { $ne: true } })
      .sort({ name: 1 })
      .exec();
  }

  async findById(id: string): Promise<DeliveryZoneDocument> {
    const zone = await this.zoneModel
      .findOne({ _id: id, isDeleted: { $ne: true } })
      .exec();
    if (!zone) throw new NotFoundException('Delivery zone not found');
    return zone;
  }

  async update(
    id: string,
    dto: UpdateDeliveryZoneDto,
  ): Promise<DeliveryZoneDocument> {
    const zone = await this.zoneModel
      .findOneAndUpdate({ _id: id, isDeleted: { $ne: true } }, dto, {
        new: true,
      })
      .exec();
    if (!zone) throw new NotFoundException('Delivery zone not found');
    return zone;
  }

  async remove(id: string): Promise<void> {
    const zone = await this.zoneModel.findById(id).exec();
    if (!zone) throw new NotFoundException('Delivery zone not found');
    zone.isDeleted = true;
    zone.deletedAt = new Date();
    await zone.save();
  }

  // ─── Fee Calculation ─────────────────────────────────────────

  /**
   * Look up the delivery fee for a given state.
   * Returns the zone's baseFee in kobo, or 0 if no zone matches.
   */
  async getFeeForState(state: string): Promise<number> {
    const zone = await this.zoneModel
      .findOne({
        states: { $regex: new RegExp(`^${state}$`, 'i') },
        isActive: true,
        isDeleted: { $ne: true },
      })
      .exec();
    return zone?.baseFee ?? 0;
  }

  /**
   * Get zone info for a given state (for frontend display).
   */
  async getZoneForState(
    state: string,
  ): Promise<{ zoneName: string; fee: number } | null> {
    const zone = await this.zoneModel
      .findOne({
        states: { $regex: new RegExp(`^${state}$`, 'i') },
        isActive: true,
        isDeleted: { $ne: true },
      })
      .exec();
    if (!zone) return null;
    return { zoneName: zone.name, fee: zone.baseFee };
  }
}

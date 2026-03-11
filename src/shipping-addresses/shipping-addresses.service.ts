import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';


import { ShippingAddress, ShippingAddressDocument } from './schemas/shipping-addresses.schema';
import { CreateShippingAddressDto, UpdateShippingAddressDto } from './dto/shipping-addresses.dto';

@Injectable()
export class ShippingAddressesService {
  private readonly logger = new Logger(ShippingAddressesService.name);

  constructor(
    @InjectModel(ShippingAddress.name)
    private shippingAddressModel: Model<ShippingAddressDocument>,
  ) {}

  // ─── Create ───────────────────────────────────────────────

  async create(
    userId: string,
    dto: CreateShippingAddressDto,
  ): Promise<ShippingAddressDocument> {
    // If this is marked as default, unset any existing default
    if (dto.isDefault) {
      await this.shippingAddressModel.updateMany(
        { userId: new Types.ObjectId(userId), isDefault: true },
        { $set: { isDefault: false } },
      );
    }

    // If this is the user's first address, make it default automatically
    const count = await this.shippingAddressModel.countDocuments({
      userId: new Types.ObjectId(userId),
    });

    const address = new this.shippingAddressModel({
      ...dto,
      userId: new Types.ObjectId(userId),
      isDefault: dto.isDefault || count === 0,
    });

    return address.save();
  }

  // ─── Find All (for user) ──────────────────────────────────

  async findAll(userId: string): Promise<ShippingAddressDocument[]> {
    return this.shippingAddressModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ isDefault: -1, createdAt: -1 })
      .exec();
  }

  // ─── Find One ─────────────────────────────────────────────

  async findOne(
    userId: string,
    addressId: string,
  ): Promise<ShippingAddressDocument> {
    const address = await this.shippingAddressModel
      .findOne({
        _id: new Types.ObjectId(addressId),
        userId: new Types.ObjectId(userId),
      })
      .exec();

    if (!address) {
      throw new NotFoundException('Shipping address not found');
    }

    return address;
  }

  // ─── Find Default ─────────────────────────────────────────

  async findDefault(userId: string): Promise<ShippingAddressDocument | null> {
    return this.shippingAddressModel
      .findOne({
        userId: new Types.ObjectId(userId),
        isDefault: true,
      })
      .exec();
  }

  // ─── Update ───────────────────────────────────────────────

  async update(
    userId: string,
    addressId: string,
    dto: UpdateShippingAddressDto,
  ): Promise<ShippingAddressDocument> {
    // Verify ownership
    const address = await this.findOne(userId, addressId);

    // If setting as default, unset others first
    if (dto.isDefault) {
      await this.shippingAddressModel.updateMany(
        {
          userId: new Types.ObjectId(userId),
          isDefault: true,
          _id: { $ne: new Types.ObjectId(addressId) },
        },
        { $set: { isDefault: false } },
      );
    }

    Object.assign(address, dto);
    return address.save();
  }

  // ─── Set Default ──────────────────────────────────────────

  async setDefault(
    userId: string,
    addressId: string,
  ): Promise<ShippingAddressDocument> {
    // Verify ownership
    await this.findOne(userId, addressId);

    // Unset all defaults
    await this.shippingAddressModel.updateMany(
      { userId: new Types.ObjectId(userId) },
      { $set: { isDefault: false } },
    );

    // Set the new default
    return this.shippingAddressModel
      .findByIdAndUpdate(addressId, { isDefault: true }, { new: true })
      .exec();
  }

  // ─── Delete ───────────────────────────────────────────────

  async remove(userId: string, addressId: string): Promise<void> {
    const address = await this.findOne(userId, addressId);
    const wasDefault = address.isDefault;

    await this.shippingAddressModel.deleteOne({ _id: address._id });

    // If we deleted the default, promote the most recent remaining one
    if (wasDefault) {
      const next = await this.shippingAddressModel
        .findOne({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .exec();

      if (next) {
        next.isDefault = true;
        await next.save();
      }
    }
  }
}

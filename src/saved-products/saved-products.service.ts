/**
 * saved-products/saved-products.service.ts - Wishlist Logic
 * ===========================================================
 * Handles saving and unsaving listings for users.
 *
 * Key features:
 * - Toggle save/unsave with a single endpoint
 * - Get all saved products with populated listing data
 * - Check if specific listings are saved (for UI hearts/bookmarks)
 * - Pagination support
 */

import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Listing, ListingDocument } from '../listings/schemas/listing.schema';
import { SavedProduct, SavedProductDocument } from './schema/saved-product.schema';

@Injectable()
export class SavedProductsService {
  private readonly logger = new Logger(SavedProductsService.name);

  constructor(
    @InjectModel(SavedProduct.name)
    private savedProductModel: Model<SavedProductDocument>,
    @InjectModel(Listing.name)
    private listingModel: Model<ListingDocument>,
  ) {}

  // ─── Toggle Save/Unsave ──────────────────────────────────────────

  /**
   * POST /saved-products/toggle
   *
   * If the listing is already saved → unsave it.
   * If not saved → save it.
   * Returns the new saved state.
   */
  async toggle(userId: string, listingId: string) {
    // Verify listing exists
    const listing = await this.listingModel.findById(listingId);
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    const existing = await this.savedProductModel.findOne({
      userId: new Types.ObjectId(userId),
      listingId: new Types.ObjectId(listingId),
    });

    if (existing) {
      await this.savedProductModel.deleteOne({ _id: existing._id });
      return { saved: false, message: 'Listing removed from saved items' };
    }

    await this.savedProductModel.create({
      userId: new Types.ObjectId(userId),
      listingId: new Types.ObjectId(listingId),
    });

    return { saved: true, message: 'Listing saved' };
  }

  // ─── Get Saved Products ──────────────────────────────────────────

  /**
   * GET /saved-products
   *
   * Returns paginated saved listings with full listing details populated.
   * Only returns listings that still exist and are live.
   */
  async getSavedProducts(userId: string, page = 1, perPage = 20) {
    const skip = (page - 1) * perPage;

    const [items, total] = await Promise.all([
      this.savedProductModel
        .find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage)
        .populate({
          path: 'listingId',
          populate: {
            path: 'storeId',
            select: 'name slug logo',
          },
        })
        .lean(),
      this.savedProductModel.countDocuments({
        userId: new Types.ObjectId(userId),
      }),
    ]);

    // Filter out saved items where the listing was deleted
    const validItems = items.filter((item) => item.listingId != null);

    return {
      items: validItems.map((item) => ({
        _id: item._id,
        savedAt: item.createdAt,
        listing: item.listingId,
      })),
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  }

  // ─── Check Saved Status ──────────────────────────────────────────

  /**
   * POST /saved-products/check
   *
   * Given an array of listing IDs, returns which ones are saved.
   * Useful for rendering heart/bookmark icons on listing cards.
   */
  async checkSavedStatus(userId: string, listingIds: string[]) {
    const saved = await this.savedProductModel
      .find({
        userId: new Types.ObjectId(userId),
        listingId: { $in: listingIds.map((id) => new Types.ObjectId(id)) },
      })
      .select('listingId')
      .lean();

    const savedSet = new Set(saved.map((s) => s.listingId.toString()));

    return listingIds.reduce(
      (acc, id) => {
        acc[id] = savedSet.has(id);
        return acc;
      },
      {} as Record<string, boolean>,
    );
  }

  // ─── Get Saved Count ─────────────────────────────────────────────

  /**
   * GET /saved-products/count
   */
  async getSavedCount(userId: string) {
    const count = await this.savedProductModel.countDocuments({
      userId: new Types.ObjectId(userId),
    });
    return { count };
  }

  // ─── Remove (explicit unsave) ────────────────────────────────────

  /**
   * DELETE /saved-products/:listingId
   */
  async remove(userId: string, listingId: string) {
    const result = await this.savedProductModel.deleteOne({
      userId: new Types.ObjectId(userId),
      listingId: new Types.ObjectId(listingId),
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Saved item not found');
    }

    return { message: 'Listing removed from saved items' };
  }
}
import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { Coupon, CouponFormData } from '../src/types/coupon';

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://aniruddhanag780_db_user:MIHtGOi9FH6Wgzd1@cluster-1.torqvts.mongodb.net/thestreetco?retryWrites=true&w=majority&appName=Cluster-1';
const DB_NAME = process.env.MONGODB_DB_NAME || 'thestreetco';
const COLLECTION_NAME = 'coupons';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const LOCAL_DB_FILE = path.join(DATA_DIR, 'coupons_backup.json');

class DatabaseService {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private collection: Collection<any> | null = null;
  private isConnected: boolean = false;

  constructor() {
    this.ensureDataDir();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  public async init(): Promise<void> {
    try {
      this.client = new MongoClient(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 8000,
      });

      await this.client.connect();
      this.db = this.client.db(DB_NAME);
      this.collection = this.db.collection(COLLECTION_NAME);
      this.isConnected = true;

      // Ensure index on code and status for fast lookups
      try {
        await this.collection.createIndex({ code: 1 });
        await this.collection.createIndex({ code: 1, status: 1 });
      } catch (idxErr) {
        // Indexes might already exist
      }

      const count = await this.collection.countDocuments();
      console.log(`[Database] Connected successfully to MongoDB "${DB_NAME}.${COLLECTION_NAME}" (${count} coupons)`);
    } catch (err: any) {
      this.isConnected = false;
      console.warn(`[Database] MongoDB connection warning: ${err.message}. Using local storage fallback.`);
    }
  }

  // Normalizes MongoDB documents from the user's existing e-commerce schema
  private mapDocToCoupon(doc: any): Coupon {
    const id = doc._id ? doc._id.toString() : doc.id || `cp_${Date.now()}`;
    const name = doc.name || doc.couponName || doc.title || doc.code || 'Discount Coupon';
    const type = doc.type === 'flat' || doc.group === 'flat' ? 'flat' : 'percentage';
    const discountValue = Number(doc.discountValue ?? doc.value ?? 0);
    const minOrderValue = Number(doc.minOrderValue ?? 0);
    const maxOrderValue = doc.maxOrderValue != null && doc.maxOrderValue !== '' ? Number(doc.maxOrderValue) : null;
    const maxDiscountCap = doc.maxDiscountCap != null && doc.maxDiscountCap !== '' 
      ? Number(doc.maxDiscountCap) 
      : (doc.maxDiscount != null ? Number(doc.maxDiscount) : null);
    
    let expiryDate: string | null = null;
    if (doc.expiryDate) {
      expiryDate = new Date(doc.expiryDate).toISOString();
    } else if (doc.expiresAt) {
      expiryDate = new Date(doc.expiresAt).toISOString();
    }

    const totalUsageLimit = doc.totalUsageLimit != null && doc.totalUsageLimit !== ''
      ? Number(doc.totalUsageLimit)
      : (doc.usageLimit != null ? Number(doc.usageLimit) : null);
    const perUserLimit = Number(doc.perUserLimit ?? 1);
    const usageCount = Number(doc.usageCount ?? 0);

    const status = doc.status === 'inactive' || doc.status === 'disabled' ? 'inactive' : 'active';
    const description = doc.description || doc.desc || doc.couponText || doc.couponSubText || doc.subText || '';
    const createdAt = doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString();
    const updatedAt = doc.updatedAt ? new Date(doc.updatedAt).toISOString() : createdAt;

    return {
      id,
      _id: id,
      name,
      code: String(doc.code || '').trim().toUpperCase(),
      type,
      discountValue,
      minOrderValue,
      maxOrderValue,
      maxDiscountCap,
      expiryDate,
      totalUsageLimit,
      perUserLimit,
      usageCount,
      userRedemptions: doc.userRedemptions || {},
      status,
      createdAt,
      updatedAt,
      description,
      source: doc.source || 'CouponCraft',
    };
  }

  public async getAllCoupons(filters?: { status?: string; type?: string; search?: string }): Promise<Coupon[]> {
    if (this.isConnected && this.collection) {
      const query: any = {};
      if (filters?.status && filters.status !== 'all') {
        query.status = filters.status;
      }
      if (filters?.type && filters.type !== 'all') {
        query.$or = [{ type: filters.type }, { group: filters.type }];
      }
      if (filters?.search) {
        const regex = new RegExp(filters.search.trim(), 'i');
        query.$or = [
          { code: regex },
          { name: regex },
          { title: regex },
          { couponName: regex },
          { desc: regex },
          { description: regex },
        ];
      }

      const docs = await this.collection.find(query).sort({ updatedAt: -1, _id: -1 }).toArray();
      return docs.map(d => this.mapDocToCoupon(d));
    }

    // Local fallback if offline
    return this.readLocalCoupons(filters);
  }

  public async getCouponByCode(code: string): Promise<Coupon | null> {
    const cleanCode = code.trim().toUpperCase();
    if (this.isConnected && this.collection) {
      const doc = await this.collection.findOne({
        code: { $regex: new RegExp(`^${cleanCode}$`, 'i') },
      });
      return doc ? this.mapDocToCoupon(doc) : null;
    }
    const local = this.readLocalCoupons();
    const found = local.find(c => c.code.toUpperCase() === cleanCode);
    return found || null;
  }

  public async getCouponById(id: string): Promise<Coupon | null> {
    if (this.isConnected && this.collection) {
      const queries: any[] = [{ id }];
      if (ObjectId.isValid(id)) {
        queries.push({ _id: new ObjectId(id) });
      }
      queries.push({ _id: id });
      const doc = await this.collection.findOne({ $or: queries });
      return doc ? this.mapDocToCoupon(doc) : null;
    }
    const local = this.readLocalCoupons();
    const found = local.find(c => c.id === id || c._id === id);
    return found || null;
  }

  public async createCoupon(data: CouponFormData): Promise<Coupon> {
    const cleanCode = data.code.trim().toUpperCase();

    const existing = await this.getCouponByCode(cleanCode);
    if (existing) {
      throw new Error(`A coupon with code "${cleanCode}" already exists.`);
    }

    const now = new Date().toISOString();
    const badge = data.type === 'percentage' 
      ? `${data.discountValue}% OFF` 
      : `FLAT ₹${data.discountValue}`;

    const newDoc: any = {
      code: cleanCode,
      name: data.name.trim(),
      title: data.name.trim(),
      couponName: data.name.trim(),
      type: data.type,
      group: data.type,
      value: Number(data.discountValue),
      discountValue: Number(data.discountValue),
      badge,
      minOrderValue: Number(data.minOrderValue) || 0,
      maxOrderValue: data.maxOrderValue !== '' && data.maxOrderValue != null ? Number(data.maxOrderValue) : null,
      maxDiscount: data.maxDiscountCap !== '' && data.maxDiscountCap != null ? Number(data.maxDiscountCap) : null,
      maxDiscountCap: data.maxDiscountCap !== '' && data.maxDiscountCap != null ? Number(data.maxDiscountCap) : null,
      expiryDate: data.expiryDate ? new Date(data.expiryDate).toISOString() : null,
      totalUsageLimit: data.totalUsageLimit !== '' && data.totalUsageLimit != null ? Number(data.totalUsageLimit) : null,
      perUserLimit: Number(data.perUserLimit) || 1,
      usageCount: 0,
      userRedemptions: {},
      status: data.status || 'active',
      desc: data.description?.trim() || '',
      description: data.description?.trim() || '',
      couponText: data.description?.trim() || '',
      source: 'CouponCraft',
      isPublic: true,
      createdAt: now,
      updatedAt: now,
    };

    if (this.isConnected && this.collection) {
      const res = await this.collection.insertOne(newDoc);
      newDoc._id = res.insertedId;
      return this.mapDocToCoupon(newDoc);
    } else {
      const local = this.readLocalCoupons();
      newDoc.id = `cp_${Date.now()}`;
      local.unshift(this.mapDocToCoupon(newDoc));
      this.writeLocalCoupons(local);
      return this.mapDocToCoupon(newDoc);
    }
  }

  public async updateCoupon(id: string, data: Partial<CouponFormData>): Promise<Coupon> {
    const existing = await this.getCouponById(id);
    if (!existing) {
      throw new Error(`Coupon with ID "${id}" not found.`);
    }

    const cleanCode = data.code ? data.code.trim().toUpperCase() : existing.code;

    if (cleanCode !== existing.code) {
      const duplicate = await this.getCouponByCode(cleanCode);
      if (duplicate && duplicate.id !== id) {
        throw new Error(`A coupon with code "${cleanCode}" already exists.`);
      }
    }

    const now = new Date().toISOString();
    const type = data.type || existing.type;
    const discountValue = data.discountValue !== undefined && data.discountValue !== '' 
      ? Number(data.discountValue) 
      : existing.discountValue;
    const badge = type === 'percentage' ? `${discountValue}% OFF` : `FLAT ₹${discountValue}`;

    const updateFields: any = {
      code: cleanCode,
      name: data.name !== undefined ? data.name.trim() : existing.name,
      title: data.name !== undefined ? data.name.trim() : existing.name,
      couponName: data.name !== undefined ? data.name.trim() : existing.name,
      type,
      group: type,
      value: discountValue,
      discountValue,
      badge,
      minOrderValue: data.minOrderValue !== undefined && data.minOrderValue !== '' ? Number(data.minOrderValue) : existing.minOrderValue,
      maxOrderValue: data.maxOrderValue !== undefined ? (data.maxOrderValue === '' || data.maxOrderValue === null ? null : Number(data.maxOrderValue)) : existing.maxOrderValue,
      maxDiscount: data.maxDiscountCap !== undefined ? (data.maxDiscountCap === '' || data.maxDiscountCap === null ? null : Number(data.maxDiscountCap)) : existing.maxDiscountCap,
      maxDiscountCap: data.maxDiscountCap !== undefined ? (data.maxDiscountCap === '' || data.maxDiscountCap === null ? null : Number(data.maxDiscountCap)) : existing.maxDiscountCap,
      expiryDate: data.expiryDate !== undefined ? (data.expiryDate ? new Date(data.expiryDate).toISOString() : null) : existing.expiryDate,
      totalUsageLimit: data.totalUsageLimit !== undefined ? (data.totalUsageLimit === '' || data.totalUsageLimit === null ? null : Number(data.totalUsageLimit)) : existing.totalUsageLimit,
      perUserLimit: data.perUserLimit !== undefined && data.perUserLimit !== '' ? Number(data.perUserLimit) : existing.perUserLimit,
      status: data.status || existing.status,
      desc: data.description !== undefined ? data.description.trim() : existing.description,
      description: data.description !== undefined ? data.description.trim() : existing.description,
      couponText: data.description !== undefined ? data.description.trim() : existing.description,
      source: 'CouponCraft',
      updatedAt: now,
    };

    if (this.isConnected && this.collection) {
      const queries: any[] = [{ id }];
      if (ObjectId.isValid(id)) {
        queries.push({ _id: new ObjectId(id) });
      }
      queries.push({ _id: id });
      await this.collection.updateOne({ $or: queries }, { $set: updateFields });
      const updated = await this.getCouponById(id);
      return updated!;
    } else {
      const local = this.readLocalCoupons();
      const idx = local.findIndex(c => c.id === id || c._id === id);
      if (idx !== -1) {
        local[idx] = { ...local[idx], ...updateFields };
        this.writeLocalCoupons(local);
        return local[idx];
      }
      throw new Error('Coupon not found');
    }
  }

  public async toggleStatus(id: string): Promise<Coupon> {
    const existing = await this.getCouponById(id);
    if (!existing) {
      throw new Error(`Coupon with ID "${id}" not found.`);
    }

    const newStatus = existing.status === 'active' ? 'inactive' : 'active';
    return this.updateCoupon(id, { status: newStatus });
  }

  public async deleteCoupon(id: string): Promise<boolean> {
    if (this.isConnected && this.collection) {
      const queries: any[] = [{ id }, { code: id }];
      if (ObjectId.isValid(id)) {
        queries.push({ _id: new ObjectId(id) });
      }
      queries.push({ _id: id });
      const res = await this.collection.deleteOne({ $or: queries });
      return res.deletedCount > 0;
    } else {
      const local = this.readLocalCoupons();
      const filtered = local.filter(c => c.id !== id && c._id !== id);
      const deleted = filtered.length !== local.length;
      if (deleted) {
        this.writeLocalCoupons(filtered);
      }
      return deleted;
    }
  }

  public async deleteAllCoupons(): Promise<{ deletedCount: number }> {
    let deletedCount = 0;
    if (this.isConnected && this.collection) {
      const res = await this.collection.deleteMany({});
      deletedCount = res.deletedCount;
    }
    this.writeLocalCoupons([]);
    return { deletedCount };
  }

  public async syncWithMongoDB(): Promise<{ syncedCount: number; connected: boolean; message: string }> {
    try {
      if (!this.isConnected || !this.collection) {
        await this.init();
      }

      if (this.isConnected && this.collection) {
        // Ensure all coupons in MongoDB have source as 'CouponCraft'
        await this.collection.updateMany(
          { $or: [{ source: { $exists: false } }, { source: { $ne: 'CouponCraft' } }] },
          { $set: { source: 'CouponCraft' } }
        );
        const count = await this.collection.countDocuments();
        return {
          syncedCount: count,
          connected: true,
          message: `Successfully synchronized ${count} coupon${count === 1 ? '' : 's'} with MongoDB. Source set to 'CouponCraft'.`,
        };
      }
    } catch (err: any) {
      console.error('[Database] Sync error:', err);
    }

    const local = this.readLocalCoupons();
    return {
      syncedCount: local.length,
      connected: false,
      message: 'MongoDB is currently not reachable; synchronized with local store.',
    };
  }

  public async recordRedemption(params: {
    code: string;
    customerId?: string;
    customerEmail?: string;
    orderId?: string;
    orderValue: number;
    discountApplied: number;
  }): Promise<{ success: boolean; coupon: Coupon }> {
    const coupon = await this.getCouponByCode(params.code);
    if (!coupon) {
      throw new Error(`Coupon "${params.code}" not found.`);
    }

    const userKey = (params.customerId || params.customerEmail || 'guest').trim().toLowerCase();
    const currentRedemptions = coupon.userRedemptions || {};
    currentRedemptions[userKey] = (currentRedemptions[userKey] || 0) + 1;
    const newUsage = (coupon.usageCount || 0) + 1;
    const now = new Date().toISOString();

    if (this.isConnected && this.collection) {
      await this.collection.updateOne(
        { code: coupon.code },
        {
          $inc: { usageCount: 1 },
          $set: {
            [`userRedemptions.${userKey.replace(/\./g, '_')}`]: currentRedemptions[userKey],
            updatedAt: now,
          },
        }
      );
    }

    coupon.usageCount = newUsage;
    coupon.userRedemptions = currentRedemptions;
    coupon.updatedAt = now;
    return { success: true, coupon };
  }

  // Local file fallback helper
  private readLocalCoupons(filters?: any): Coupon[] {
    try {
      if (fs.existsSync(LOCAL_DB_FILE)) {
        const raw = fs.readFileSync(LOCAL_DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch {}
    return [];
  }

  private writeLocalCoupons(coupons: Coupon[]): void {
    try {
      fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(coupons, null, 2), 'utf-8');
    } catch {}
  }
}

export const dbService = new DatabaseService();

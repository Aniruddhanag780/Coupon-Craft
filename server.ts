import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { dbService } from './server/db';
import { validateCouponCheckout } from './src/utils/couponValidation';
import { ValidationRequest } from './src/types/coupon';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.DEFAULT_APP_PORT) || 3000;

async function startServer() {
  const app = express();
  app.use(express.json());
  // Serve static assets from public/ (PWA manifest, icons, service worker)
  app.use(express.static(path.resolve(__dirname, 'public')));

  // Initialize DB service (connects to Mongo if URI present, otherwise local persistent store)
  await dbService.init();

  // ---------------------------------------------------------------------------
  // Coupon API Endpoints
  // ---------------------------------------------------------------------------

  // List all coupons
  app.get('/api/coupons', async (req: Request, res: Response) => {
    try {
      const { status, type, search } = req.query;
      const coupons = await dbService.getAllCoupons({
        status: status as string,
        type: type as string,
        search: search as string,
      });
      res.json({ success: true, coupons, count: coupons.length });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get single coupon
  app.get('/api/coupons/:id', async (req: Request, res: Response) => {
    try {
      const coupon = await dbService.getCouponById(req.params.id);
      if (!coupon) {
        return res.status(404).json({ success: false, error: 'Coupon not found' });
      }
      res.json({ success: true, coupon });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Create new coupon
  app.post('/api/coupons', async (req: Request, res: Response) => {
    try {
      const {
        name,
        code,
        type,
        discountValue,
        minOrderValue,
        maxOrderValue,
        maxDiscountCap,
        expiryDate,
        totalUsageLimit,
        perUserLimit,
        status,
        description,
      } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, error: 'Coupon name is required.' });
      }
      if (!code || !code.trim()) {
        return res.status(400).json({ success: false, error: 'Coupon code is required.' });
      }
      if (!['percentage', 'flat'].includes(type)) {
        return res.status(400).json({ success: false, error: 'Invalid coupon type. Must be percentage or flat.' });
      }
      if (discountValue === undefined || discountValue === '' || Number(discountValue) <= 0) {
        return res.status(400).json({ success: false, error: 'Discount value must be greater than 0.' });
      }
      if (type === 'percentage' && Number(discountValue) > 100) {
        return res.status(400).json({ success: false, error: 'Percentage discount cannot exceed 100%.' });
      }

      const created = await dbService.createCoupon({
        name,
        code,
        type,
        discountValue,
        minOrderValue: minOrderValue ?? 0,
        maxOrderValue: maxOrderValue || null,
        maxDiscountCap: maxDiscountCap || null,
        expiryDate: expiryDate || '',
        totalUsageLimit: totalUsageLimit || null,
        perUserLimit: perUserLimit ?? 1,
        status: status || 'active',
        description,
      });

      res.status(201).json({ success: true, coupon: created });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Update existing coupon
  app.put('/api/coupons/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updated = await dbService.updateCoupon(id, req.body);
      res.json({ success: true, coupon: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Toggle coupon status (active <-> inactive)
  app.patch('/api/coupons/:id/status', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updated = await dbService.toggleStatus(id);
      res.json({ success: true, coupon: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Delete single coupon
  app.delete('/api/coupons/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await dbService.deleteCoupon(id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Coupon not found or already deleted.' });
      }
      res.json({ success: true, message: 'Coupon deleted successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Delete all coupons (bulk wipe from MongoDB)
  app.delete('/api/coupons', async (_req: Request, res: Response) => {
    try {
      const result = await dbService.deleteAllCoupons();
      res.json({ success: true, message: `All coupons deleted (${result.deletedCount} removed from MongoDB).` });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Sync all coupons with MongoDB
  app.post('/api/coupons/sync', async (_req: Request, res: Response) => {
    try {
      const result = await dbService.syncWithMongoDB();
      const coupons = await dbService.getAllCoupons();
      res.json({
        success: true,
        message: result.message,
        syncedCount: result.syncedCount,
        connected: result.connected,
        coupons,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Fast Checkout Validation API (Used by e-commerce checkout & simulator)
  app.post('/api/coupons/validate', async (req: Request, res: Response) => {
    try {
      const { code, orderValue, customerId, customerEmail } = req.body;

      if (!code) {
        return res.status(400).json({
          isValid: false,
          discountAmount: 0,
          finalOrderValue: Number(orderValue) || 0,
          reason: 'Coupon code is required.',
        });
      }

      const numOrderValue = Number(orderValue) || 0;
      const coupon = await dbService.getCouponByCode(code);

      const validationRequest: ValidationRequest = {
        code,
        orderValue: numOrderValue,
        customerId,
        customerEmail,
      };

      const result = validateCouponCheckout(coupon, validationRequest);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ isValid: false, reason: err.message, discountAmount: 0, finalOrderValue: 0 });
    }
  });

  // Record order checkout redemption
  app.post('/api/coupons/redeem', async (req: Request, res: Response) => {
    try {
      const { code, orderValue, customerId, customerEmail, orderId } = req.body;
      const coupon = await dbService.getCouponByCode(code);

      const val = validateCouponCheckout(coupon, {
        code,
        orderValue: Number(orderValue) || 0,
        customerId,
        customerEmail,
      });

      if (!val.isValid) {
        return res.status(400).json({ success: false, error: val.reason });
      }

      const redeemed = await dbService.recordRedemption({
        code,
        customerId,
        customerEmail,
        orderId,
        orderValue: Number(orderValue) || 0,
        discountApplied: val.discountAmount,
      });

      res.json({
        success: true,
        discountApplied: val.discountAmount,
        finalTotal: val.finalOrderValue,
        coupon: redeemed.coupon,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // ---------------------------------------------------------------------------
  // Vite Integration (Dev) vs Static Files (Prod)
  // ---------------------------------------------------------------------------

  const httpServer = http.createServer(app);

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server: httpServer,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] CouponCraft server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});

import express from 'express';
import { getDashboardStats, getUsers, updateUserRole } from '../controllers/adminController.js';
import { orderService } from '../services/dbService.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth + admin guard globally on these routes
router.use(protect);
router.use(admin);

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);

// Admin Order Management
router.get('/orders', async (req, res, next) => {
  try {
    const orders = await orderService.findAll();
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

router.put('/orders/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      res.status(400);
      throw new Error('Please provide status');
    }
    const updated = await orderService.updateStatus(req.params.id, status);
    if (updated) {
      res.json(updated);
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    next(error);
  }
});

export default router;

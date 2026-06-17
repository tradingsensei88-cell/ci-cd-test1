import { orderService, userService, productService } from '../services/dbService.js';

// @desc    Get dashboard analytics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res, next) => {
  try {
    const orders = await orderService.findAll();
    const users = await userService.findAll();
    const products = await productService.findAll({});

    // Calculations
    const totalOrders = orders.length;
    const totalUsers = users.length;
    
    // Revenue calculations (exclude cancelled orders)
    const paidOrders = orders.filter(o => o.isPaid || o.status !== 'Cancelled');
    const totalSales = paidOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    // Stock alert (countInStock < 5)
    const lowStockAlerts = products.filter(p => p.countInStock < 5);

    // Group sales by date for charts
    // Group last 7 orders or last 7 days of sales
    const salesHistory = orders
      .filter(o => o.isPaid || o.status !== 'Cancelled')
      .slice(0, 10)
      .map(o => ({
        date: new Date(o.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        amount: o.totalPrice,
      }))
      .reverse();

    res.json({
      totalSales: Math.round(totalSales * 100) / 100,
      totalOrders,
      totalUsers,
      lowStockProducts: lowStockAlerts.length,
      salesHistory,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res, next) => {
  try {
    const users = await userService.findAll();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user admin status
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res, next) => {
  try {
    const user = await userService.findById(req.params.id);

    if (user) {
      // Prevent admin from removing their own admin privilege
      if (user._id.toString() === req.user._id.toString()) {
        res.status(400);
        throw new Error('You cannot remove your own admin privileges');
      }

      const updatedUser = await userService.update(req.params.id, {
        isAdmin: !user.isAdmin,
      });

      res.json(updatedUser);
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

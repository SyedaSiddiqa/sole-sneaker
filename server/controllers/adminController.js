import User from '../models/User.js'
import Product from '../models/Product.js'
import Order from '../models/Order.js'
import Cart from '../models/Cart.js'
import asyncHandler from '../utils/asyncHandler.js'
import AppError from '../utils/appError.js'

// GET /api/admin/stats
export const getStats = asyncHandler(async (_req, res) => {
  const [totalProducts, totalUsers, totalOrders, revenueAgg, statusAgg, recentOrders, lowStock] = await Promise.all([
    Product.countDocuments(),
    User.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([{ $match: { status: { $ne: 'Cancelled' } } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(5),
    Product.countDocuments({ stock: { $lte: 5 } }),
  ])
  res.json({
    totalProducts,
    totalUsers,
    totalOrders,
    totalRevenue: revenueAgg[0]?.total || 0,
    ordersByStatus: Object.fromEntries(statusAgg.map((s) => [s._id, s.count])),
    recentOrders,
    lowStock,
  })
})

// GET /api/admin/users
export const getUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 })
  const counts = await Order.aggregate([{ $group: { _id: '$user', orders: { $sum: 1 } } }])
  const map = Object.fromEntries(counts.map((c) => [String(c._id), c.orders]))
  res.json({ users: users.map((u) => ({ ...u.toJSON(), orders: map[u.id] || 0 })) })
})

// DELETE /api/admin/users/:id
export const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) throw new AppError('You cannot delete your own account', 400)
  const user = await User.findById(req.params.id)
  if (!user) throw new AppError('User not found', 404)
  await user.deleteOne()
  await Cart.deleteOne({ user: user._id })
  res.json({ message: 'User deleted', id: req.params.id })
})

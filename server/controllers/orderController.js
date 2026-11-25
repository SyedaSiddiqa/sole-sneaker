import Cart from '../models/Cart.js'
import Order, { ORDER_STATUSES } from '../models/Order.js'
import Product from '../models/Product.js'
import asyncHandler from '../utils/asyncHandler.js'
import AppError from '../utils/appError.js'

const FREE_SHIPPING_OVER = 200
const SHIPPING_FEE = 15

async function restock(items) {
  await Promise.all(
    items.map((i) => Product.updateOne({ _id: i.product }, { $inc: { stock: i.qty, popularity: -i.qty } }))
  )
}

// POST /api/orders — builds the order from the authenticated user's server-side cart.
// Prices and stock are always taken from the database, never from the client.
export const createOrder = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product')
  const lines = (cart?.items || []).filter((i) => i.product)
  if (!lines.length) throw new AppError('Your cart is empty', 400)

  const items = lines.map((l) => ({
    product: l.product._id,
    name: l.product.name,
    image: l.product.images?.[0],
    price: l.product.price,
    color: l.color,
    size: l.size,
    qty: l.qty,
  }))

  // Reserve stock atomically per line; roll back on failure (no multi-doc transactions needed)
  const reserved = []
  try {
    for (const item of items) {
      const r = await Product.updateOne(
        { _id: item.product, stock: { $gte: item.qty } },
        { $inc: { stock: -item.qty, popularity: item.qty } }
      )
      if (r.modifiedCount !== 1) throw new AppError(`"${item.name}" does not have enough stock`, 400)
      reserved.push(item)
    }
  } catch (err) {
    await restock(reserved)
    throw err
  }

  const itemsPrice = items.reduce((s, i) => s + i.price * i.qty, 0)
  const shippingPrice = itemsPrice > FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE
  const { customer, shippingAddress, notes } = req.body

  let order
  try {
    order = await Order.create({
      user: req.user._id,
      items,
      customer,
      shippingAddress,
      notes,
      paymentMethod: 'COD',
      itemsPrice,
      shippingPrice,
      totalPrice: itemsPrice + shippingPrice,
      statusHistory: [{ status: 'Pending' }],
    })
  } catch (err) {
    await restock(items)
    throw err
  }

  await Cart.updateOne({ user: req.user._id }, { items: [] })
  res.status(201).json({ order })
})

// GET /api/orders/mine
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 })
  res.json({ orders })
})

// GET /api/orders/:id — owner or admin
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email')
  if (!order) throw new AppError('Order not found', 404)
  const ownerId = order.user._id?.toString() || order.user.toString()
  if (ownerId !== req.user._id.toString() && req.user.role !== 'admin') throw new AppError('Forbidden', 403)
  res.json({ order })
})

// PATCH /api/orders/:id/cancel — customers can cancel until it ships
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (!order) throw new AppError('Order not found', 404)
  if (order.user.toString() !== req.user._id.toString()) throw new AppError('Forbidden', 403)
  if (!['Pending', 'Processing'].includes(order.status)) {
    throw new AppError(`An order that is ${order.status.toLowerCase()} can no longer be cancelled`, 400)
  }
  order.status = 'Cancelled'
  order.statusHistory.push({ status: 'Cancelled' })
  await order.save()
  await restock(order.items)
  res.json({ order })
})

// ---- Admin ----
// GET /api/orders
export const getAllOrders = asyncHandler(async (req, res) => {
  const filter = req.query.status && ORDER_STATUSES.includes(req.query.status) ? { status: req.query.status } : {}
  const orders = await Order.find(filter).populate('user', 'name email').sort({ createdAt: -1 })
  res.json({ orders })
})

// PATCH /api/orders/:id/status
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body
  const order = await Order.findById(req.params.id)
  if (!order) throw new AppError('Order not found', 404)
  if (order.status === status) return res.json({ order })
  if (order.status === 'Cancelled') throw new AppError('Cancelled orders cannot be changed', 400)
  if (order.status === 'Delivered' && status !== 'Delivered') throw new AppError('Delivered orders cannot be changed', 400)

  if (status === 'Cancelled') await restock(order.items)
  order.status = status
  order.statusHistory.push({ status })
  if (status === 'Delivered') {
    order.deliveredAt = new Date()
    order.isPaid = true // cash on delivery is settled on delivery
    order.paidAt = new Date()
  }
  await order.save()
  res.json({ order })
})

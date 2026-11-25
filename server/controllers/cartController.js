import Cart from '../models/Cart.js'
import Product from '../models/Product.js'
import asyncHandler from '../utils/asyncHandler.js'
import AppError from '../utils/appError.js'

// Normalise a cart document into the shape the React UI consumes
export async function buildCart(userId) {
  const cart = await Cart.findOne({ user: userId }).populate('items.product')
  const items = (cart?.items || [])
    .filter((i) => i.product) // product may have been deleted
    .map((i) => ({
      lineId: i._id.toString(),
      id: i.product._id.toString(),
      name: i.product.name,
      price: i.product.price,
      image: i.product.images?.[0],
      color: i.color,
      size: i.size,
      qty: i.qty,
      stock: i.product.stock,
    }))
  return { items }
}

async function getOrCreate(userId) {
  return (await Cart.findOne({ user: userId })) || (await Cart.create({ user: userId, items: [] }))
}

async function addToCart(cart, { productId, color, size, qty = 1 }) {
  const product = await Product.findById(productId)
  if (!product) throw new AppError('Product not found', 404)
  if (!product.colors.includes(color)) throw new AppError(`Color ${color} is not available`, 400)
  if (!product.sizes.includes(Number(size))) throw new AppError(`Size ${size} is not available`, 400)
  const existing = cart.items.find((i) => i.product.equals(product._id) && i.color === color && i.size === Number(size))
  const newQty = Math.min((existing?.qty || 0) + Number(qty), 10)
  if (newQty > product.stock) throw new AppError(`Only ${product.stock} left in stock for ${product.name}`, 400)
  if (existing) existing.qty = newQty
  else cart.items.push({ product: product._id, color, size: Number(size), qty: newQty })
}

export const getCart = asyncHandler(async (req, res) => res.json(await buildCart(req.user._id)))

export const addItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreate(req.user._id)
  await addToCart(cart, req.body)
  await cart.save()
  res.status(201).json(await buildCart(req.user._id))
})

export const updateItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreate(req.user._id)
  const item = cart.items.id(req.params.itemId)
  if (!item) throw new AppError('Cart item not found', 404)
  const qty = Number(req.body.qty)
  if (qty < 1) cart.items = cart.items.filter((i) => !i._id.equals(item._id))
  else {
    const product = await Product.findById(item.product)
    if (product && qty > product.stock) throw new AppError(`Only ${product.stock} left in stock`, 400)
    item.qty = Math.min(qty, 10)
  }
  await cart.save()
  res.json(await buildCart(req.user._id))
})

export const removeItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreate(req.user._id)
  cart.items = cart.items.filter((i) => i._id.toString() !== req.params.itemId)
  await cart.save()
  res.json(await buildCart(req.user._id))
})

export const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] })
  res.json({ items: [] })
})

// POST /api/cart/merge — merge a guest (localStorage) cart after login
export const mergeCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreate(req.user._id)
  for (const line of req.body.items || []) {
    try {
      await addToCart(cart, { productId: line.id, color: line.color, size: line.size, qty: line.qty })
    } catch {
      /* skip lines that are no longer valid */
    }
  }
  await cart.save()
  res.json(await buildCart(req.user._id))
})

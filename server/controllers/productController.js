import Product from '../models/Product.js'
import asyncHandler from '../utils/asyncHandler.js'
import AppError from '../utils/appError.js'

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const list = (v) => (v ? String(v).split(',').map((x) => x.trim()).filter(Boolean) : [])

const SORTS = {
  featured: { featured: -1, popularity: -1, createdAt: -1 },
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
  newest: { createdAt: -1 },
  rating: { rating: -1, numReviews: -1 },
  popular: { popularity: -1 },
}

// GET /api/products?search=&category=&sizes=40,41&colors=Black&minPrice=&maxPrice=&sort=&page=&limit=&featured=
export const getProducts = asyncHandler(async (req, res) => {
  const { search, category, minPrice, maxPrice, sort = 'featured', featured } = req.query
  const page = Math.max(parseInt(req.query.page) || 1, 1)
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 48)

  const filter = {}
  if (search?.trim()) {
    const rx = new RegExp(escapeRegex(search.trim()), 'i')
    filter.$or = [{ name: rx }, { category: rx }, { description: rx }]
  }
  if (category && category !== 'All') filter.category = category
  const sizes = list(req.query.sizes).map(Number).filter(Number.isFinite)
  if (sizes.length) filter.sizes = { $in: sizes }
  const colors = list(req.query.colors)
  if (colors.length) filter.colors = { $in: colors }
  if (minPrice || maxPrice) {
    filter.price = {}
    if (minPrice) filter.price.$gte = Number(minPrice)
    if (maxPrice) filter.price.$lte = Number(maxPrice)
  }
  if (featured === 'true') filter.featured = true

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(SORTS[sort] || SORTS.featured)
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ])
  res.json({ products, page, pages: Math.max(Math.ceil(total / limit), 1), total })
})

// GET /api/products/:id
export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) throw new AppError('Product not found', 404)
  res.json({ product })
})

// GET /api/products/:id/related
export const getRelated = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) throw new AppError('Product not found', 404)
  const related = await Product.find({ category: product.category, _id: { $ne: product._id } })
    .sort({ popularity: -1 })
    .limit(3)
  res.json({ products: related })
})

// ---- Admin ----
const pick = (b) => ({
  name: b.name,
  description: b.description,
  category: b.category,
  price: b.price === undefined ? undefined : Number(b.price),
  colors: b.colors,
  sizes: b.sizes === undefined ? undefined : b.sizes.map(Number),
  images: b.images,
  stock: b.stock === undefined ? undefined : Number(b.stock),
  tag: b.tag,
  featured: b.featured,
})

export const createProduct = asyncHandler(async (req, res) => {
  const data = pick(req.body)
  Object.keys(data).forEach((k) => data[k] === undefined && delete data[k])
  const product = await Product.create(data)
  res.status(201).json({ product })
})

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) throw new AppError('Product not found', 404)
  const data = pick(req.body)
  Object.keys(data).forEach((k) => data[k] !== undefined && (product[k] = data[k]))
  await product.save()
  res.json({ product })
})

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id)
  if (!product) throw new AppError('Product not found', 404)
  res.json({ message: 'Product deleted', id: req.params.id })
})

import User from '../models/User.js'
import Product from '../models/Product.js'
import asyncHandler from '../utils/asyncHandler.js'
import AppError from '../utils/appError.js'

const respond = async (userId, res, status = 200) => {
  const user = await User.findById(userId).populate('wishlist')
  res.status(status).json({ products: user.wishlist.filter(Boolean) })
}

export const getWishlist = asyncHandler(async (req, res) => respond(req.user._id, res))

export const addToWishlist = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId)
  if (!product) throw new AppError('Product not found', 404)
  await User.updateOne({ _id: req.user._id }, { $addToSet: { wishlist: product._id } })
  await respond(req.user._id, res, 201)
})

export const removeFromWishlist = asyncHandler(async (req, res) => {
  await User.updateOne({ _id: req.user._id }, { $pull: { wishlist: req.params.productId } })
  await respond(req.user._id, res)
})

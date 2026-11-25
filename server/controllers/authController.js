import User from '../models/User.js'
import generateToken from '../utils/generateToken.js'
import asyncHandler from '../utils/asyncHandler.js'
import AppError from '../utils/appError.js'

const authResponse = (user) => ({ user: user.toJSON(), token: generateToken(user._id) })

// POST /api/auth/register  — role is always "customer"; admins come from the seed script
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body
  const exists = await User.findOne({ email: email.toLowerCase() })
  if (exists) throw new AppError('An account with this email already exists', 409)
  const user = await User.create({ name, email, password, role: 'customer' })
  res.status(201).json(authResponse(user))
})

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
  if (!user || !(await user.matchPassword(password))) throw new AppError('Invalid email or password', 401)
  res.json(authResponse(user))
})

// GET /api/auth/me
export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user })
})

// PUT /api/auth/me
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password')
  if (req.body.name) user.name = req.body.name
  if (req.body.password) {
    if (!req.body.currentPassword || !(await user.matchPassword(req.body.currentPassword))) {
      throw new AppError('Current password is incorrect', 400)
    }
    user.password = req.body.password
  }
  await user.save()
  res.json(authResponse(user))
})

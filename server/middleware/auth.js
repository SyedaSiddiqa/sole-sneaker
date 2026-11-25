import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import asyncHandler from '../utils/asyncHandler.js'
import AppError from '../utils/appError.js'

// Requires a valid "Authorization: Bearer <token>" header
export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) throw new AppError('Not authorized — please sign in', 401)
  const token = header.split(' ')[1]
  let decoded
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    throw new AppError('Session expired or invalid — please sign in again', 401)
  }
  const user = await User.findById(decoded.id)
  if (!user) throw new AppError('User no longer exists', 401)
  req.user = user
  next()
})

// Role-based access control — must run after `protect`
export const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user?.role)) return next(new AppError('Forbidden — insufficient permissions', 403))
  next()
}

export const adminOnly = authorize('admin')

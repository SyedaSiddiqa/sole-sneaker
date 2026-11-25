import { Router } from 'express'
import { body } from 'express-validator'
import rateLimit from 'express-rate-limit'
import { register, login, me, updateProfile } from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'
import validate from '../middleware/validate.js'

const router = Router()

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: process.env.NODE_ENV === 'production' ? 20 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts — please try again later' },
})

const passwordRule = body('password')
  .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  .matches(/[A-Za-z]/).withMessage('Password must contain a letter')
  .matches(/\d/).withMessage('Password must contain a number')

router.post(
  '/register',
  limiter,
  [
    body('name').trim().isLength({ min: 2, max: 60 }).withMessage('Name must be 2–60 characters'),
    body('email').trim().isEmail().withMessage('Please provide a valid email'),
    passwordRule,
  ],
  validate,
  register
)
router.post(
  '/login',
  limiter,
  [body('email').trim().isEmail().withMessage('Please provide a valid email'), body('password').notEmpty().withMessage('Password is required')],
  validate,
  login
)
router.get('/me', protect, me)
router.put(
  '/me',
  protect,
  [
    body('name').optional().trim().isLength({ min: 2, max: 60 }).withMessage('Name must be 2–60 characters'),
    body('password').optional().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  updateProfile
)

export default router

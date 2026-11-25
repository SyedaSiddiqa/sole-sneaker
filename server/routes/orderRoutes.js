import { Router } from 'express'
import { body, param } from 'express-validator'
import { createOrder, getMyOrders, getOrder, cancelOrder, getAllOrders, updateOrderStatus } from '../controllers/orderController.js'
import { protect, adminOnly } from '../middleware/auth.js'
import validate from '../middleware/validate.js'
import { ORDER_STATUSES } from '../models/Order.js'

const router = Router()
router.use(protect)

router.post(
  '/',
  [
    body('customer.name').trim().notEmpty().withMessage('Full name is required'),
    body('customer.email').trim().isEmail().withMessage('A valid email is required'),
    body('customer.phone').trim().matches(/^[+\d][\d\s()-]{6,19}$/).withMessage('A valid phone number is required'),
    body('shippingAddress.street').trim().notEmpty().withMessage('Street address is required'),
    body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
    body('shippingAddress.state').trim().notEmpty().withMessage('State is required'),
    body('shippingAddress.zip').trim().notEmpty().withMessage('ZIP code is required'),
    body('shippingAddress.country').optional().trim().notEmpty(),
    body('paymentMethod').equals('COD').withMessage('Only Cash on Delivery is available'),
    body('notes').optional().isLength({ max: 500 }).withMessage('Notes are limited to 500 characters'),
  ],
  validate,
  createOrder
)
router.get('/mine', getMyOrders)
router.get('/', adminOnly, getAllOrders)
router.get('/:id', param('id').isMongoId().withMessage('Invalid order id'), validate, getOrder)
router.patch('/:id/cancel', param('id').isMongoId(), validate, cancelOrder)
router.patch(
  '/:id/status',
  adminOnly,
  [param('id').isMongoId(), body('status').isIn(ORDER_STATUSES).withMessage(`Status must be one of: ${ORDER_STATUSES.join(', ')}`)],
  validate,
  updateOrderStatus
)

export default router

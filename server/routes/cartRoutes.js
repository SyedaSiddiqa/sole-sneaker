import { Router } from 'express'
import { body, param } from 'express-validator'
import { getCart, addItem, updateItem, removeItem, clearCart, mergeCart } from '../controllers/cartController.js'
import { protect } from '../middleware/auth.js'
import validate from '../middleware/validate.js'

const router = Router()
router.use(protect)

router.get('/', getCart)
router.post(
  '/items',
  [
    body('productId').isMongoId().withMessage('Invalid product'),
    body('color').notEmpty().withMessage('Select a color'),
    body('size').isInt().withMessage('Select a size'),
    body('qty').optional().isInt({ min: 1, max: 10 }).withMessage('Quantity must be 1–10'),
  ],
  validate,
  addItem
)
router.post('/merge', body('items').optional().isArray(), validate, mergeCart)
router.patch('/items/:itemId', [param('itemId').isMongoId(), body('qty').isInt({ min: 0, max: 10 }).withMessage('Quantity must be 0–10')], validate, updateItem)
router.delete('/items/:itemId', param('itemId').isMongoId(), validate, removeItem)
router.delete('/', clearCart)

export default router

import { Router } from 'express'
import { body, param } from 'express-validator'
import { getProducts, getProduct, getRelated, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js'
import { protect, adminOnly } from '../middleware/auth.js'
import validate from '../middleware/validate.js'
import { CATEGORIES, COLORS, SIZES } from '../models/Product.js'

const router = Router()

const productRules = (optional = false) => {
  const f = (chain) => (optional ? chain.optional() : chain)
  return [
    f(body('name').trim().notEmpty().withMessage('Name is required')),
    f(body('description').trim().notEmpty().withMessage('Description is required')),
    f(body('category').isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`)),
    f(body('price').isFloat({ min: 1 }).withMessage('Price must be a number ≥ 1')),
    f(body('colors').isArray({ min: 1 }).withMessage('Select at least one color')),
    body('colors.*').optional().isIn(COLORS).withMessage('Invalid color'),
    f(body('sizes').isArray({ min: 1 }).withMessage('Select at least one size')),
    body('sizes.*').optional().isIn(SIZES).withMessage('Invalid size'),
    f(body('images').isArray({ min: 1 }).withMessage('Add at least one image URL')),
    body('images.*').optional().isURL({ require_tld: false }).withMessage('Image must be a valid URL'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a whole number ≥ 0'),
  ]
}

router.get('/', getProducts)
router.get('/:id', param('id').isMongoId().withMessage('Invalid product id'), validate, getProduct)
router.get('/:id/related', param('id').isMongoId().withMessage('Invalid product id'), validate, getRelated)

router.post('/', protect, adminOnly, productRules(false), validate, createProduct)
router.put('/:id', protect, adminOnly, param('id').isMongoId(), productRules(true), validate, updateProduct)
router.delete('/:id', protect, adminOnly, param('id').isMongoId(), validate, deleteProduct)

export default router

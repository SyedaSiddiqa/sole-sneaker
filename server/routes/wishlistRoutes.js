import { Router } from 'express'
import { param } from 'express-validator'
import { getWishlist, addToWishlist, removeFromWishlist } from '../controllers/wishlistController.js'
import { protect } from '../middleware/auth.js'
import validate from '../middleware/validate.js'

const router = Router()
router.use(protect)

router.get('/', getWishlist)
router.post('/:productId', param('productId').isMongoId().withMessage('Invalid product'), validate, addToWishlist)
router.delete('/:productId', param('productId').isMongoId().withMessage('Invalid product'), validate, removeFromWishlist)

export default router

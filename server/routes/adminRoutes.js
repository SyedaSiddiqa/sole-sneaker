import { Router } from 'express'
import { param } from 'express-validator'
import { getStats, getUsers, deleteUser } from '../controllers/adminController.js'
import { protect, adminOnly } from '../middleware/auth.js'
import validate from '../middleware/validate.js'

const router = Router()
router.use(protect, adminOnly)

router.get('/stats', getStats)
router.get('/users', getUsers)
router.delete('/users/:id', param('id').isMongoId(), validate, deleteUser)

export default router

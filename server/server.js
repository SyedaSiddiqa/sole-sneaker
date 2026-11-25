import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'

dotenv.config()

import connectDB from './config/db.js'
import { notFound, errorHandler } from './middleware/error.js'
import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import wishlistRoutes from './routes/wishlistRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import adminRoutes from './routes/adminRoutes.js'

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  console.error('FATAL: JWT_SECRET must be set (16+ characters) in server/.env')
  process.exit(1)
}

const app = express()
const __dirname = path.dirname(fileURLToPath(import.meta.url))

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: false }))
app.use(cors({ origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(','), credentials: true }))
app.use(express.json({ limit: '1mb' }))
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'))

app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }))
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/admin', adminRoutes)

// In production, serve the built React app from the same server
const dist = path.join(__dirname, '..', 'dist')
if (process.env.NODE_ENV === 'production' && fs.existsSync(dist)) {
  app.use(express.static(dist))
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')))
}

app.use('/api', notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000
connectDB()
  .then(() => app.listen(PORT, () => console.log(`SOLE API running on http://localhost:${PORT}`)))
  .catch((err) => {
    console.error('Failed to start server:', err.message)
    process.exit(1)
  })

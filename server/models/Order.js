import mongoose from 'mongoose'
import { jsonTransform } from './toJSON.js'

export const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: String,
    price: { type: Number, required: true },
    color: String,
    size: Number,
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
)

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [orderItemSchema], validate: [(v) => v.length > 0, 'Order must contain items'] },
    customer: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      phone: { type: String, required: true, trim: true },
    },
    shippingAddress: {
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      zip: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true, default: 'United States' },
    },
    paymentMethod: { type: String, enum: ['COD'], default: 'COD' },
    notes: { type: String, trim: true, maxlength: 500, default: '' },
    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ORDER_STATUSES, default: 'Pending' },
    statusHistory: [{ status: String, at: { type: Date, default: Date.now }, _id: false }],
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    deliveredAt: Date,
  },
  { timestamps: true, toJSON: jsonTransform, toObject: jsonTransform }
)

export default mongoose.model('Order', orderSchema)

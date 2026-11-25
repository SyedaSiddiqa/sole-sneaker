import mongoose from 'mongoose'
import { jsonTransform } from './toJSON.js'

export const CATEGORIES = ['Running', 'Lifestyle', 'Training', 'Signature']
export const COLORS = ['Black', 'White', 'Gold', 'Red', 'Blue']
export const SIZES = [38, 39, 40, 41, 42, 43, 44]

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true, maxlength: 80 },
    description: { type: String, required: [true, 'Description is required'], trim: true, maxlength: 2000 },
    category: { type: String, required: true, enum: CATEGORIES },
    price: { type: Number, required: true, min: [1, 'Price must be at least 1'] },
    colors: { type: [{ type: String, enum: COLORS }], validate: [(v) => v.length > 0, 'At least one color is required'] },
    sizes: { type: [{ type: Number, enum: SIZES }], validate: [(v) => v.length > 0, 'At least one size is required'] },
    images: { type: [String], validate: [(v) => v.length > 0, 'At least one image is required'] },
    stock: { type: Number, default: 50, min: 0 },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    numReviews: { type: Number, default: 0, min: 0 },
    popularity: { type: Number, default: 0, min: 0 }, // units sold — drives "Most Popular" sorting
    tag: { type: String, trim: true, maxlength: 20, default: '' },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: jsonTransform, toObject: jsonTransform }
)

productSchema.index({ category: 1, price: 1 })
productSchema.index({ popularity: -1 })

// Convenience: primary image used across the existing UI
productSchema.virtual('image').get(function () {
  return this.images?.[0]
})

export default mongoose.model('Product', productSchema)

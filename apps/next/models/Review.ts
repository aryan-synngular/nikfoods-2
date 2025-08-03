// models/Review.ts
import mongoose, { Schema, model, models, Document, Types } from 'mongoose'

export interface IReview extends Document {
  user: Types.ObjectId
  order: Types.ObjectId
  rating: number
  reviewText: string
  selectedItems: string[]
  isVerifiedPurchase: boolean
  helpfulVotes: number
  voters: Types.ObjectId[]
  createdAt?: Date
}

const ReviewSchema = new Schema<IReview>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    reviewText: { type: String, required: true },
    selectedItems: [{ type: String, required: true }],
    isVerifiedPurchase: { type: Boolean, default: true },
    helpfulVotes: { type: Number, default: 0 },
    voters: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
)

// ✅ Ensure only one review per user per order
ReviewSchema.index({ user: 1, order: 1 }, { unique: true })

export default models.Review || model<IReview>('Review', ReviewSchema)

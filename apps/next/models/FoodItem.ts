import mongoose, { Schema, Document, models, model } from 'mongoose'
import FoodCategory from './FoodCategory'

export interface IFoodItem {
  _id?: mongoose.Types.ObjectId
  name: string
  description: string
  price: number
  category: mongoose.Types.ObjectId[]
  veg: boolean
  available: boolean
  public_id: string
  createdAt?: Date
  updatedAt?: Date
  url?: string
  isEcoFriendlyContainer?: boolean
  hasSpiceLevel?: boolean
  portions?: string[]
}

const FoodItemSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    short_description: { type: String, default: "A perfect balance of taste, aroma, and warmth." },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    category: [{ type: Schema.Types.ObjectId, ref: FoodCategory }],
    veg: { type: Boolean, required: true },
    available: { type: Boolean, default: true },
    public_id: { type: String, default: '' },
    url: { type: String, default: '' },
    isEcoFriendlyContainer: { type: Boolean, default: false },
    hasSpiceLevel: { type: Boolean, default: false },
    portions: [{ type: String, default: [] }],
  },
  { timestamps: true }
)

const FoodItem = models?.FoodItem || model<IFoodItem>('FoodItem', FoodItemSchema)
export default FoodItem

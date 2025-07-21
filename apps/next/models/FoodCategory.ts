import mongoose, { Schema, Document, models, model } from 'mongoose'

export interface IFoodCategory {
  _id: string // MongoDB ObjectId as string
  name: string
  description?: string
  url?: string
  public_id?: string
  createdAt?: Date
  updatedAt?: Date
}

const FoodCategorySchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    url: { type: String, default: '' },
    public_id: { type: String, default: '' },
  },
  { timestamps: true }
)

const FoodCategory =
  models?.FoodCategory || model<IFoodCategory>('FoodCategory', FoodCategorySchema)
export default FoodCategory

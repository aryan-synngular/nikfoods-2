import mongoose, { Schema, Document, Types, model, models } from 'mongoose'

export interface IAllDaysAvailable extends Document {
  foodItems: Array<{
    category: {
      _id: Types.ObjectId
      name: string
      url?: string
    }
    foodItems: Array<{
      _id: Types.ObjectId
      name: string
      price: number
      description: string
      url?: string
      veg: boolean
      available: boolean
    }>
  }>
}

const AllDaysAvailableSchema = new Schema<IAllDaysAvailable>(
  {
    foodItems: [
      {
        category: {
          _id: { type: Schema.Types.ObjectId, ref: 'FoodCategory', required: true },
          name: { type: String, required: true },
          url: { type: String, default: '' }
        },
        foodItems: [
          {
            _id: { type: Schema.Types.ObjectId, ref: 'FoodItem', required: true },
            name: { type: String, required: true },
            price: { type: Number, required: true },
            description: { type: String, default: '' },
            url: { type: String, default: '' },
            veg: { type: Boolean, required: true },
            available: { type: Boolean, default: true }
          }
        ]
      }
    ]
  },
  { timestamps: true }
)

const AllDaysAvailable = models?.AllDaysAvailable || model<IAllDaysAvailable>('AllDaysAvailable', AllDaysAvailableSchema)

export default AllDaysAvailable

import { Schema, model, models, Document, Types } from 'mongoose'

export interface IUpdatingOrderItem {
  food: Types.ObjectId
  quantity: number
  price: number
}

export interface IUpdatingOrderDay {
  day: string
  deliveryDate: Date
  items: IUpdatingOrderItem[]
  dayTotal: number
}

export interface IUpdatingOrder extends Document {
  originalOrderId: Types.ObjectId
  items: IUpdatingOrderDay[]
  createdAt?: Date
  updatedAt?: Date
}

const UpdatingOrderSchema = new Schema<IUpdatingOrder>(
  {
    originalOrderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    items: [
      {
        day: {
          type: String,
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          required: true,
        },
        deliveryDate: { type: Date, required: true },
        items: [
          {
            food: { type: Schema.Types.ObjectId, ref: 'FoodItem', required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
          },
        ],
        dayTotal: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
)

export default models.UpdatingOrder || model<IUpdatingOrder>('UpdatingOrder', UpdatingOrderSchema)

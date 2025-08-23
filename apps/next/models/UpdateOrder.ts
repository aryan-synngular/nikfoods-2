import { Schema, model, models, Document, Types } from 'mongoose'

export interface IUpdatingOrderItem {
  food: Types.ObjectId
  quantity: number
}

export interface IUpdatingOrderDay {
  day: string
  deliveryDate: Date
  items: IUpdatingOrderItem[]
}

export type PaymentStatus = 'unpaid' | 'paid' | 'failed' | 'refunded'

export type PaymentMethod = 'Credit Card' | 'Debit Card' | 'PayPal' | 'Cash on Delivery'
export type OrderStatus = 'pending' | 'confirmed' | 'cancelled'

export interface IUpdatingOrder extends Document {
  originalOrderId: Types.ObjectId
  items: IUpdatingOrderDay[]
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  status: OrderStatus
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
          },
        ],
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'failed', 'refunded'],
      default: 'unpaid',
    },
    paymentMethod: {
      type: String,
      enum: ['Credit Card', 'Debit Card', 'PayPal', 'Cash on Delivery'],
      default: 'Credit Card',
    },
  },
  { timestamps: true }
)

export default models.UpdatingOrder || model<IUpdatingOrder>('UpdatingOrder', UpdatingOrderSchema)

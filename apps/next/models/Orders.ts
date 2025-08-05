// models/Order.ts
import mongoose, { Schema, model, models, Document, Types } from 'mongoose'

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'dispatched'
  | 'delivered'
  | 'cancelled'

export type PaymentMethod = 'Credit Card' | 'Debit Card' | 'PayPal' | 'Cash on Delivery'

export interface IOrderItem {
  food: Types.ObjectId
  quantity: number
  price: number
}

export interface IOrderDay {
  day: string // 'Monday' to 'Sunday'
  deliveryDate: Date
  items: IOrderItem[]
  dayTotal: number
}

export interface IOrder extends Document {
  user: Types.ObjectId
  address: Types.ObjectId
  deliveryBoy?: Types.ObjectId
  orderId: string
  items: IOrderDay[]
  totalPaid: number
  status: OrderStatus
  paymentMethod: PaymentMethod
  platformFee: number
  deliveryFee: number
  discount: {
    amount: number
    code?: string
  }
  taxes: number
  createdAt?: Date
  updatedAt?: Date
}

const OrderSchema = new Schema<IOrder>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      default: () => `#ORD-${Date.now()}${Math.floor(Math.random() * 1000)}`,
    },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    address: { type: Schema.Types.ObjectId, ref: 'Address', required: false },
    deliveryBoy: { type: Schema.Types.ObjectId, ref: 'DeliveryBoy', default: null },

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

    totalPaid: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'dispatched', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['Credit Card', 'Debit Card', 'PayPal', 'Cash on Delivery'],
      default: 'Credit Card',
    },
    platformFee: { type: Number, default: 1.0 },
    deliveryFee: { type: Number, default: 10.0 },
    discount: {
      amount: { type: Number, default: 0 },
      code: { type: String, default: null },
    },
    taxes: { type: Number, default: 0 },
  },
  { timestamps: true }
)

OrderSchema.methods.calculateTotalAmount = function () {
  const itemTotal = this.items.reduce((acc: number, day: IOrderDay) => acc + day.dayTotal, 0)
  return itemTotal + this.platformFee + this.deliveryFee - this.discount.amount + this.taxes
}

export default models.Order || model<IOrder>('Order', OrderSchema)

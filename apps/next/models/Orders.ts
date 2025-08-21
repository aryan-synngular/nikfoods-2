// models/Order.ts
import mongoose, { Schema, model, models, Document, Types } from 'mongoose'

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'

export type PaymentStatus = 'unpaid' | 'paid' | 'failed' | 'refunded'

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
  currency: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  stripePaymentIntentId?: string
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
    currency: { type: String, default: 'usd', enum: ['usd', 'inr'] },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
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
    stripePaymentIntentId: { type: String, sparse: true },
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

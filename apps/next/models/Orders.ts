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

export interface IFoodItemCopy {
  _id: Types.ObjectId
  name: string
  short_description?: string
  description?: string
  price: number
  category?: Types.ObjectId[]
  veg?: boolean
  available?: boolean
  public_id?: string
  url?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface IAddressCopy {
  _id: Types.ObjectId
  user: Types.ObjectId
  name: string
  email: string
  phone: string
  street_address: string
  city: string
  province: string
  postal_code: string
  location_remark?: string
}

export interface IOrderItem {
  food: IFoodItemCopy
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
  address: IAddressCopy
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

const FoodItemCopySchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    short_description: { type: String },
    description: { type: String },
    price: { type: Number, required: true },
    category: [{ type: Schema.Types.ObjectId }],
    veg: { type: Boolean },
    available: { type: Boolean },
    public_id: { type: String },
    url: { type: String },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { _id: false }
)

const AddressCopySchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, required: true },
    user: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    street_address: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String },
    postal_code: { type: String, required: true },
    location_remark: { type: String },
  },
  { _id: false }
)

const OrderSchema = new Schema<IOrder>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      default: () => `#ORD-${Date.now()}${Math.floor(Math.random() * 1000)}`,
    },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    address: { type: AddressCopySchema, required: true },
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
            food: { type: FoodItemCopySchema, required: true },
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

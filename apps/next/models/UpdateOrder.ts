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
export interface IUpdatingOrder extends Document {
  originalOrderId: Types.ObjectId
  items: IUpdatingOrderDay[]
  reaarrangedItems: IOrderDay[]
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  status: OrderStatus
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
    reaarrangedItems:[
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

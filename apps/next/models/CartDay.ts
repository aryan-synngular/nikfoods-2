import mongoose, { Schema, Document, Types, model, models } from 'mongoose'
import CartItem, { ICartItem } from './CartItem'

export enum WeekDays {
  SUNDAY = 'Sunday',
  MONDAY = 'Monday',
  TUESDAY = 'Tuesday',
  WEDNESDAY = 'Wednesday',
  THURSDAY = 'Thursday',
  FRIDAY = 'Friday',
  SATURDAY = 'Saturday',
}
export interface ICartDay {
  day: WeekDays // e.g., "Monday"
  date: Date
  cart_value: Number
  cart: mongoose.Types.ObjectId
  items: mongoose.Types.ObjectId[] | ICartItem[] // Array of CartItem references
}

const CartDaySchema = new Schema<ICartDay>({
  day: { type: String, enum: Object.values(WeekDays), required: true },
  cart_value: { type: Number, default: 0 },
  date: { type: Date, required: false },
  cart: { type: Schema.Types.ObjectId, ref: 'Cart', required: true },
  items: [{ type: Schema.Types.ObjectId, ref: CartItem }], // Reference to CartItem
})

const CartDay = models?.CartDay || model<ICartDay>('CartDay', CartDaySchema)
export default CartDay

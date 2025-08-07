import mongoose, { Schema, Document, Types, model, models } from 'mongoose'
import FoodItem, { IFoodItem } from './FoodItem' // Assuming you already have this
import CartDay from './CartDay'

export interface ICartItem extends Document {
  food: Types.ObjectId | IFoodItem
  quantity: number
  day: mongoose.Types.ObjectId
  cart: mongoose.Types.ObjectId
  user: mongoose.Types.ObjectId
}

const CartItemSchema = new Schema<ICartItem>({
  food: { type: Schema.Types.ObjectId, ref: FoodItem, required: true },
  quantity: { type: Number, default: 1 },
  day: { type: Schema.Types.ObjectId, ref: 'CartDay', required: true },
  cart: { type: Schema.Types.ObjectId, ref: 'Cart', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
},{
  timestamps: true,
})

const CartItem = models?.CartItem || model<ICartItem>('CartItem', CartItemSchema)
export default CartItem

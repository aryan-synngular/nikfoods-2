import { Schema, Document, Types, model, models } from 'mongoose'
import CartDay, { ICartDay } from './CartDay'
import User from './User'

export interface ICart extends Document {
  user: Types.ObjectId
  days: Types.ObjectId[] | ICartDay[] // Reference to CartDay documents
}

const CartSchema = new Schema<ICart>({
  user: { type: Schema.Types.ObjectId, ref: User, required: true },
  days: [{ type: Schema.Types.ObjectId, ref: CartDay }], // Reference instead of embedding
})

const Cart = models?.Cart || model<ICart>('Cart', CartSchema)
export default Cart

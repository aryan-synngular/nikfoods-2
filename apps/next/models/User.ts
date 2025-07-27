import mongoose, { Schema, model, models } from 'mongoose'
import bcrypt from 'bcryptjs'
import Address, { IAddress } from './Address'

export type IROLE = 'ADMIN' | 'USER'
export interface IUser {
  email: string
  role: IROLE
  password: string
  _id?: mongoose.Types.ObjectId
  addresses?: IAddress[]
  isCompleted?: boolean
  createdAt?: Date
  updatedAt?: Date
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, default: 'USER' },
    isCompleted: { type: Boolean, default: false },
    addresses: [{ type: Schema.Types.ObjectId, ref: Address }],
  },
  { timestamps: true }
)

// userSchema.pre('save', async function (next) {
//   if (this.isModified('password')) {
//     this.password = await bcrypt.hash(this.password, 10)
//   }
//   next()
// })

const User = models?.User || model<IUser>('User', userSchema)

export default User

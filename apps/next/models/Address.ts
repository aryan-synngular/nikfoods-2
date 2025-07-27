import { Schema, model, models, Document, Types } from 'mongoose'

export interface IAddress extends Document {
  user: Types.ObjectId // Reference to User
  name: string
  location_remark?: string
  phone?: string
  email: string
  street_address: string
  city: string
  province: string
  postal_code: string
  notes?: string
  createdAt?: Date
  updatedAt?: Date
}

const addressSchema = new Schema<IAddress>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    location_remark: { type: String },
    phone: { type: String },
    email: { type: String, required: true },
    street_address: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, required: true },
    postal_code: { type: String, required: true },
    notes: { type: String },
  },
  { timestamps: true }
)

const Address = models.Address || model<IAddress>('Address', addressSchema)
export default Address

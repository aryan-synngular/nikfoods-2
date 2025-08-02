// models/DeliveryBoy.ts
import { Schema, model, models, Document } from 'mongoose'

export interface IDeliveryBoy extends Document {
  name: string
  phone: string
  email: string
  vehicleNumber: string
  active: boolean
  assignedOrders: string[]
}

const DeliveryBoySchema = new Schema<IDeliveryBoy>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    vehicleNumber: { type: String, required: true },
    active: { type: Boolean, default: true },
    assignedOrders: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
  },
  { timestamps: true }
)

export default models.DeliveryBoy || model<IDeliveryBoy>('DeliveryBoy', DeliveryBoySchema)

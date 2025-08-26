import mongoose, { Schema, model, models, Document } from 'mongoose'

export interface IZincode extends Document {
  zipcode: string
  minCartValue: number
  createdAt?: Date
  updatedAt?: Date
}

const ZincodeSchema = new Schema<IZincode>(
  {
    zipcode: { type: String, required: true, unique: true },
    minCartValue: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
)

// Create index for faster searches
ZincodeSchema.index({ zipcode: 1 })

const Zincode = models?.Zincode || model<IZincode>('Zincode', ZincodeSchema)

export default Zincode

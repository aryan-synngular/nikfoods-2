import mongoose, { Schema, model, models, Document, Types } from 'mongoose'

export interface IRefreshToken extends Document {
  _id: mongoose.Types.ObjectId
  user: Types.ObjectId // Reference to User
  refresh_token: string
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    refresh_token: { type: String, required: true },
  },
  { timestamps: true }
)

const RefreshToken = models.RefreshToken || model<IRefreshToken>('RefreshToken', refreshTokenSchema)
export default RefreshToken

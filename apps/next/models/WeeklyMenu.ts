import mongoose, { Schema, Document, models, model } from 'mongoose'
import FoodItem, { IFoodItem } from './FoodItem'

export interface IWeeklyMenu {
  _id?: mongoose.Types.ObjectId
  monday: mongoose.Types.ObjectId[] | IFoodItem[]
  tuesday: mongoose.Types.ObjectId[] | IFoodItem[]
  wednesday: mongoose.Types.ObjectId[] | IFoodItem[]
  thursday: mongoose.Types.ObjectId[] | IFoodItem[]
  friday: mongoose.Types.ObjectId[] | IFoodItem[]
  saturday: mongoose.Types.ObjectId[] | IFoodItem[]
  weekStartDate: Date // To track which week this menu belongs to
  active: boolean // To mark if this weekly menu is currently active
  createdAt?: Date
  updatedAt?: Date
}

const WeeklyMenuSchema: Schema = new Schema(
  {
    monday: [{ type: Schema.Types.ObjectId, ref: FoodItem }],
    tuesday: [{ type: Schema.Types.ObjectId, ref: FoodItem }],
    wednesday: [{ type: Schema.Types.ObjectId, ref: FoodItem }],
    thursday: [{ type: Schema.Types.ObjectId, ref: FoodItem }],
    friday: [{ type: Schema.Types.ObjectId, ref: FoodItem }],
    saturday: [{ type: Schema.Types.ObjectId, ref: FoodItem }],
    weekStartDate: { type: Date, required: true },
    active: { type: Boolean, default: false },
  },
  { timestamps: true }
)

// Index to ensure only one active weekly menu at a time
WeeklyMenuSchema.index({ active: 1 })
// Index for efficient date-based queries
WeeklyMenuSchema.index({ weekStartDate: 1 })

const WeeklyMenu = models?.WeeklyMenu || model<IWeeklyMenu>('WeeklyMenu', WeeklyMenuSchema)
export default WeeklyMenu

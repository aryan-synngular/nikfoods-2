import mongoose, { Schema, Document, models, model } from 'mongoose';
import FoodCategory from './FoodCategory';


export interface IFoodItem {
    _id?: mongoose.Types.ObjectId
  name: string;
  description: string;
  price: number;
  category: mongoose.Types.ObjectId[];
  veg: boolean;
  available: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const FoodItemSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String,default:"" },
    price: { type: Number, required: true },
    category: [{ type: Schema.Types.ObjectId, ref: FoodCategory }],
    veg: { type: Boolean, required: true },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const FoodItem=models?.FoodItem || model<IFoodItem>('FoodItem', FoodItemSchema);
export default FoodItem 

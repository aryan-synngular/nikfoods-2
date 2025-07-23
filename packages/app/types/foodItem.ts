import { IFoodCategory } from './category'

export interface IFoodItem {
  _id: string
  name: string
  description: string
  url: string
  price: number
  category: IFoodCategory[]
  veg: boolean
  available: boolean
  public_id: string
  createdAt: string
  updatedAt: string
}

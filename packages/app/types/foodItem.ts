import { IFoodCategory } from './category'

export interface IFoodItem {
  _id: string
  name: string
  description: string
  short_description: string
  url: string
  price: number
  category: IFoodCategory[]
  veg: boolean
  available: boolean
  public_id: string
  createdAt: string
  updatedAt: string
  isEcoFriendlyContainer?: boolean
  hasSpiceLevel?: boolean
  portions?: string[]
}

export interface IFoodItemsResponse {
  items: IFoodItem[]
}

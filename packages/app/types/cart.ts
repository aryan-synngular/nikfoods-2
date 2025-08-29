import { IUser } from './auth'
import { DAYS } from 'app/constants/app.constant'
import { IFoodItem } from './foodItem'
import { IAddress } from './user'

export type DayType = keyof typeof DAYS

export interface ICart {
  _id: string
  user: IUser
  days: ICartDay[]
  selectedAddress?: IAddress
}
export interface ICartDay {
  _id: string
  day: DayType
  date: string
  cart_value: ICart
  items: ICartItem[]
}
export interface ICartItem {
  _id: string
  food: IFoodItem
  quantity: number
  day: ICartDay
}

export interface ICartResponse {
  data: ICart
}

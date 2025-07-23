import { ROLE } from 'app/constants/app.constant'
export type RoleType = keyof typeof ROLE

export interface IUser {
  _id: string
  email: string
  role: RoleType
  isCompleted: boolean
  addresses: IAddress
  createdAt: string
  updatedAt: string
}

export interface IAddress {
  _id: string
  user: IUser
  name: string
  email: string
  location_remark: string
  phone: string
  street_address: string
  city: string
  province: string
  postal_code: string
  notes: string
  createdAt: string
  updatedAt: string
}


export interface IAddressResponse {
  items:IAddress[]
}
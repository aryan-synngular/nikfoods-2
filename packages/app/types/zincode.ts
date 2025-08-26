export interface IZincode {
  _id: string
  zipcode: string
  minCartValue: number
  createdAt: string
  updatedAt: string
}

export interface IZincodesResponse {
  items: IZincode[]
}

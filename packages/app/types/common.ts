export interface IResponse<T> {
  data: T
  message: string
}

export interface IListResponse<T> {
  items: T[]
  page: number
  total: number
  pageSize: number
}
export interface ISelectOption {
  label: string
  value: string
}

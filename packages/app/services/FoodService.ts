import type { AxiosRequestConfig } from 'axios'
import ApiServices from './ApiService'

export async function apiGetFoodItems<T>({
  search = '',
  category = 'all',
  vegOnly = null,
  page = 1,
  limit = 7,
}): Promise<T> {
  console.log("vegeOnly:", vegOnly)
  const url = `food-item?category=${category}&page=${page}&limit=${limit}&search=${search}&vegOnly=${vegOnly}`

  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'GET',
    headers: {},
    maxRedirects: 5,
  }
  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('FoodItems:', response.data)
    return response.data
  } catch (error) {
    console.error('Error FoodItems:', error)
    throw error
  }
}

export async function apiGetCategory<T>(): Promise<T> {
  const url = `food-category`

  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'GET',
    headers: {},
    maxRedirects: 5,
  }
  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Category:', response.data)
    return response.data
  } catch (error) {
    console.error('Error Category:', error)
    throw error
  }
}

export async function apiGetFoodItemsByCategory<T>({
  search = '',
  vegOnly = false,
}: {
  search?: string
  vegOnly?: boolean
} = {}): Promise<T> {
  const params = new URLSearchParams()
  if (search) params.append('search', search)
  if (vegOnly) params.append('vegOnly', 'true')

  const url = `food-items-by-category${params.toString() ? `?${params.toString()}` : ''}`

  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'GET',
    headers: {},
    maxRedirects: 5,
  }
  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('FoodItemsByCategory:', response.data)
    return response.data
  } catch (error) {
    console.error('Error FoodItemsByCategory:', error)
    throw error
  }
}

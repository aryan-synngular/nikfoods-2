import { AxiosRequestConfig } from 'axios'
import ApiServices from './ApiService'

export async function apiAddFoodItemToCart<T, S>(data: S, token?: string): Promise<T> {
  const url = `cart/add-item${token ? `?token=${token}` : ''}`
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'POST',
    headers: {},
    data: { ...data },
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Add Cart', response.data)
    return response.data
  } catch (error) {
    console.error('Error Add Cart:', error)
    throw error
  }
}

export async function apiGetCart<T>(token?: string): Promise<T> {
  const url = `cart/get-cart${token ? `?token=${token}` : ''}`

  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'GET',
    headers: {},
    maxRedirects: 5,
  }
  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Cart:', response.data)
    return response.data
  } catch (error) {
    console.error('Error Cart:', error)
    throw error
  }
}

export async function apiClearCart<T>(token?: string): Promise<T> {
  const url = `cart/clear${token ? `?token=${token}` : ''}`

  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'POST',
    headers: {},
    maxRedirects: 5,
  }
  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Cart clear:', response.data)
    return response.data
  } catch (error) {
    console.error('Error Cart clear:', error)
    throw error
  }
}

export async function apiGetCartTotalAmount<T>(token?: string): Promise<T> {
  const url = `cart/get-total-amount${token ? `?token=${token}` : ''}`

  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'GET',
    headers: {},
    maxRedirects: 5,
  }
  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Cart total:', response.data)
    return response.data
  } catch (error) {
    console.error('Error Cart total:', error)
    throw error
  }
}

export async function apiUpdateCartItemQuantity<T, S>(data: S): Promise<T> {
  const url = `cart-item`
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'PUT',
    headers: {},
    data: { ...data },
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Cart Item Quantity', response.data)
    return response.data
  } catch (error) {
    console.error('Error Cart Item Quantity:', error)
    throw error
  }
}

export async function apiGetCartReccomendations<T>(
  { page = 1, limit = 5 },
  token?: string
): Promise<T> {
  const url = `cart/get-cart-recommendations?page=${page}&limit=${limit}${token ? `&token=${token}` : ''}`

  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'GET',
    headers: {},
    maxRedirects: 5,
  }
  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Cart Recoomendation:', response.data)
    return response.data
  } catch (error) {
    console.error('Error Cart Recoomendation:', error)
    throw error
  }
}

export async function apiUpdateCartAddress<T, S>(data: S): Promise<T> {
  const url = `cart/update-address`
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'PUT',
    headers: {},
    data: { ...data },
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Cart Address Update:', response.data)
    return response.data
  } catch (error) {
    console.error('Error Cart Address Update:', error)
    throw error
  }
}

export async function apiGetCartAddress<T>(): Promise<T> {
  const url = `cart/update-address`

  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'GET',
    headers: {},
    maxRedirects: 5,
  }
  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Cart Address:', response.data)
    return response.data
  } catch (error) {
    console.error('Error Cart Address:', error)
    throw error
  }
}

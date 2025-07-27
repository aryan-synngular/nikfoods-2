import { AxiosRequestConfig } from 'axios'
import ApiServices from './ApiService'

export async function apiAddFoodItemToCart<T, S>(data: S): Promise<T> {
  const url = `cart/add-item`
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

export async function apiGetCart<T>(): Promise<T> {
  const url = `cart/get-cart`

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

export async function apiGetCartTotalAmount<T>(): Promise<T> {
  const url = `cart/get-total-amount`

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

export async function apiGetCartReccomendations<T>({ page = 1, limit = 5 }): Promise<T> {
  const url = `cart/get-cart-recommendations?page=${page}&limit=${limit}`

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

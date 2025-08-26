import type { AxiosRequestConfig } from 'axios'
import ApiServices from './ApiService'

export async function apiGetZincodes<T>({
  search = '',
  page = 1,
  limit = 7,
}: {
  search?: string
  page?: number
  limit?: number
} = {}): Promise<T> {
  const url = `min-cart-value?search=${search}&page=${page}&limit=${limit}`

  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'GET',
    headers: {},
    maxRedirects: 5,
  }
  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Zincodes:', response.data)
    return response.data
  } catch (error) {
    console.error('Error Zincodes:', error)
    throw error
  }
}

export async function apiCreateZincode<T>(zincodeData: {
  zipcode: string
  minCartValue: number
}): Promise<T> {
  const url = `min-cart-value`

  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: zincodeData,
    maxRedirects: 5,
  }
  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Create Zincode:', response.data)
    return response.data
  } catch (error) {
    console.error('Error Create Zincode:', error)
    throw error
  }
}

export async function apiUpdateZincode<T>(id: string, zincodeData: {
  zipcode: string
  minCartValue: number
}): Promise<T> {
  const url = `min-cart-value?id=${id}`

  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: zincodeData,
    maxRedirects: 5,
  }
  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Update Zincode:', response.data)
    return response.data
  } catch (error) {
    console.error('Error Update Zincode:', error)
    throw error
  }
}

export async function apiDeleteZincode<T>(id: string): Promise<T> {
  const url = `min-cart-value?id=${id}`

  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'DELETE',
    headers: {},
    maxRedirects: 5,
  }
  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Delete Zincode:', response.data)
    return response.data
  } catch (error) {
    console.error('Error Delete Zincode:', error)
    throw error
  }
}

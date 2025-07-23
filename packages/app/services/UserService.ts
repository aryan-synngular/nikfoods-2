import type { AxiosRequestConfig } from 'axios'
import ApiServices from './ApiService'

export async function apiGetAllAddress<T>(): Promise<T> {
  const url = `address`

  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'GET',
    headers: {},
    maxRedirects: 5,
  }
  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log(response)
    console.log('All Address:', response.data)
    return response.data
  } catch (error) {
    console.error('Error all address:', error)
    throw error?.response?.data
  }
}

export async function apiGetAllUsers<T>(): Promise<T> {
  const url = `user`

  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'GET',
    headers: {},
    maxRedirects: 5,
  }
  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log(response)
    console.log('All users:', response.data)
    return response.data
  } catch (error) {
    console.error('Error all user', error)
    throw error?.response?.data
  }
}

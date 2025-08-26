import { AxiosRequestConfig } from 'axios'
import ApiServices from './ApiService'

export async function apiGetAllDaysAvailable<T, S = any>(): Promise<T> {
  const url = 'all-days-available-fooditems'
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'GET',
    headers: {},
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('All Days Available:', response.data)
    return response.data
  } catch (error) {
    console.error('Error fetching All Days Available:', error)
    throw error
  }
}

export async function apiUpdateAllDaysAvailable<T, S>(data: S): Promise<T> {
  const url = 'all-days-available-fooditems'
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'PUT',
    headers: {},
    data: { ...data },
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('All Days Available Updated:', response.data)
    return response.data
  } catch (error) {
    console.error('Error updating All Days Available:', error)
    throw error
  }
}

import type { AxiosRequestConfig } from 'axios'
import ApiServices from './ApiService'

export async function apiGetAllAddress<T>(token?: string): Promise<T> {
  const url = `address${token ? `?token=${token}` : ''}`

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

export async function apiAddUserAddress<T, S>(data: S): Promise<T> {
  const url = `address`
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'POST',
    headers: {},
    data: { ...data },
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Added Address', response.data)
    return response.data
  } catch (error) {
    console.error('Error Adding Address:', error)
    throw error
  }
}

export async function apiEditUserAddress<T, S>(data: S): Promise<T> {
  const url = `address`
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'PUT',
    headers: {},
    data: { ...data },
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Edited Address', response.data)
    return response.data
  } catch (error) {
    console.error('Error Editing Address:', error)
    throw error
  }
}

export async function apiDeleteUserAddress<T, S>(id: string): Promise<T> {
  const url = `address?id=${id}`
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'DELETE',
    headers: {},
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Deleted Address', response.data)
    return response.data
  } catch (error) {
    console.error('Error Deleted Address:', error)
    throw error
  }
}

export async function apiGetPlaces<T>(input: string): Promise<T> {
  const url = `places?input=${input}`

  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'GET',
    headers: {},
    maxRedirects: 5,
  }
  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log(response)
    console.log('All places:', response.data)
    return response.data
  } catch (error) {
    console.error('Error all places', error)
    throw error?.response?.data
  }
}

export async function apiGetPlaceDetails<T>(placeId: string): Promise<T> {
  const url = `places/details?place_id=${placeId}`

  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'GET',
    headers: {},
    maxRedirects: 5,
  }
  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log(response)
    console.log('Place details:', response.data)
    return response.data
  } catch (error) {
    console.error('Error fetching place details', error)
    throw error?.response?.data
  }
}

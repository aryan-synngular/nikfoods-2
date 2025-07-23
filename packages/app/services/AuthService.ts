import type { AxiosRequestConfig } from 'axios'
import ApiServices from './ApiService'

export async function createVisitData<T, S>(visitId: string | undefined, data: S): Promise<T> {
  const url = `cases/visits/${visitId}` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'PATCH',
    headers: {},
    data,
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Case data created:', response)
    return response.data
  } catch (error) {
    console.error('Error creating case data:', error)
    throw new Error(error)
  }
}

export async function apiEditVisitData<T, U>(visitId: string | undefined, data: U): Promise<T> {
  const url = `cases/visits/${visitId}` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'PATCH',
    headers: {},
    data,
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Text data created:', response.data)
    return response.data
  } catch (error) {
    console.error('Error editting Text data:', error)
    throw error
  }
}

export async function apiEditAnthropometryData<T, U>(anthropometryId: number, data: U): Promise<T> {
  const url = `cases/anthropometry/${anthropometryId}` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'PATCH',
    headers: {},
    data,
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Text data created:', response.data)
    return response.data
  } catch (error) {
    console.error('Error editting anthropometry data:', error)
    throw error
  }
}

export async function getVisitbyCaseID<T>(caseId: string | number): Promise<T> {
  const url = `cases/visits/case/${Number(caseId)}`

  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'GET',
    headers: {},
    maxRedirects: 5,
  }
  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Case data created:', response.data)
    return response.data
  } catch (error) {
    console.error('Error creating case data:', error)
    throw error
  }
}

export async function apiRegisterUser<T, S>(data: S): Promise<T> {
  const url = `auth/register`
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'POST',
    headers: {},
    data: { ...data },
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('User Registered', response.data)
    return response.data
  } catch (error) {
    console.error('Error Registering User:', error)
    throw error
  }
}

export async function apiAddAddress<T, S>(data: S): Promise<T> {
  const url = `auth/register-step2`
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

export async function apiLoginUser<T, S>(data: S): Promise<T> {
  const url = `auth/login`
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'POST',
    headers: {},
    data: { ...data },
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('User LooggedIn', response.data)
    return response.data
  } catch (error) {
    console.error('Error Loogging User:', error)
    throw error
  }
}

export async function updateVisitStatus<T>(visitId: number, status: string): Promise<T> {
  const url = `cases/visit-status/${visitId}` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'PATCH',
    headers: {},
    data: { status },
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Visit status updated:', response.data)
    return response.data
  } catch (error) {
    console.error('Error updating visit status:', error)
    throw error
  }
}

export async function apiDeleteServicesData<T>(seriveId: number): Promise<T> {
  const url = `cases/services/${seriveId}` // Use the endpoint and workspaceId
  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'DELETE',
    headers: {},
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Case data created:', response.data)
    return response.data
  } catch (error) {
    console.error('Error creating case data:', error)
    throw error
  }
}

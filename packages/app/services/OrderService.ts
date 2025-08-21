import { AxiosRequestConfig } from 'axios'
import ApiServices from './ApiService'

// Get all orders for the authenticated user
export async function apiGetOrders<T>(token?: string): Promise<T> {
  const url = `orders${token ? `?token=${token}` : ''}`

  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'GET',
    headers: {},
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('All fetching orders::', response.data)
    return response.data
  } catch (error) {
    console.error('Error fetching orders::', error)
    throw error?.response?.data
  }
}

export async function apiCreateOrder<T>(orderData: any, token?: string): Promise<T> {
  const url = `orders${token ? `?token=${token}` : ''}`

  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'POST',
    data: orderData,
    headers: {},
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Order Created ', response.data)
    return response.data
  } catch (error) {
    console.error('Error in orders creation', error)
    throw error?.response?.data
  }
}

// New secure order creation function for the checkout flow
export async function apiCreateSecureOrder<T>(
  orderData: {
    deliveryAddress: string
    currency?: string
  },
  token?: string
): Promise<T> {
  const url = `orders/create${token ? `?token=${token}` : ''}`

  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'POST',
    data: orderData,
    headers: {
      'Content-Type': 'application/json',
    },
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Secure order created:', response.data)
    return response.data
  } catch (error) {
    console.error('Error in secure order creation:', error)
    throw error?.response?.data
  }
}

export async function apiSubmitReview<T>(reviewData: {
  order: string
  rating: number
  reviewText: string
  selectedItems: string[]
}): Promise<T> {
  const url = 'reviews'

  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: reviewData,
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Review submitted::', response.data)
    return response.data
  } catch (error) {
    console.error('Error submitting review::', error)
    throw error?.response?.data
  }
}

export async function apiCheckout<T>(
  payload: {
    amount: number
    orderId?: string
    currency?: string
  },
  token?: string
): Promise<T> {
  const url = `checkout${token ? `?token=${token}` : ''}`

  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: payload,
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('checkout Details', response.data)
    return response.data
  } catch (error) {
    console.error('Error submitting checkout:', error)
    throw error?.response?.data
  }
}

// Get specific order details by order ID
export async function apiGetOrderDetails<T>(orderId: string): Promise<T> {
  const url = `orders/${orderId}`

  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'GET',
    headers: {},
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Order details fetched::', response.data)
    return response.data
  } catch (error) {
    console.error('Error fetching order details::', error)
    throw error?.response?.data
  }
}

export async function apiUpdateOrderItems<T>(
  payload: { updatingOrderId: string } | { orderId: string; updatedItems: any }
): Promise<T> {
  const url = `orders/update`

  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: payload as any,
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Order items updated successfully::', response.data)
    return response.data
  } catch (error) {
    console.error('Error updating order items::', error)
    throw error?.response?.data
  }
}
// Track order status
export async function apiTrackOrder<T>(orderId: string): Promise<T> {
  const url = `orders/${orderId}/track`

  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'GET',
    headers: {},
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Order tracking info::', response.data)
    return response.data
  } catch (error) {
    console.error('Error tracking order::', error)
    throw error?.response?.data
  }
}

// Reorder (create new order based on existing order)
export async function apiReorder<T>(orderId: string): Promise<T> {
  const url = `orders/${orderId}/reorder`

  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'POST',
    headers: {},
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    console.log('Reorder created successfully::', response.data)
    return response.data
  } catch (error) {
    console.error('Error creating reorder::', error)
    throw error?.response?.data
  }
}

export async function apiCreateUpdatingOrder<T>(payload: {
  orderId: string
  cartItems: Record<string, Record<string, number>>
}): Promise<T> {
  const url = `updating-order`

  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: payload,
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    return response.data
  } catch (error) {
    throw error?.response?.data
  }
}

export async function apiGetUpdatingOrderById<T>(updatingOrderId: string): Promise<T> {
  const url = `updating-order/${updatingOrderId}`

  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'GET',
    headers: {},
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    return response.data
  } catch (error) {
    throw error?.response?.data
  }
}

export async function apiGetAdminOrders<T>({
  page = 1,
  limit = 10,
  status = 'all',
}: {
  page?: number
  limit?: number
  status?: string
} = {}): Promise<T> {
  const url = `orders/admin?page=${page}&limit=${limit}&status=${status}`

  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'GET',
    headers: {},
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    return response.data
  } catch (error) {
    console.error('Error fetching admin orders::', error)
    throw error?.response?.data
  }
}

// Generate a short-lived JWT for checkout
export async function apiGenerateCheckoutToken<T>(): Promise<T> {
  const url = 'checkout/generate-token'

  const axiosConfig: AxiosRequestConfig = {
    url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: {},
    maxRedirects: 5,
  }

  try {
    const response = await ApiServices.fetchData<T>(axiosConfig)
    return response.data
  } catch (error) {
    console.error('Error generating checkout token::', error)
    throw error?.response?.data
  }
}

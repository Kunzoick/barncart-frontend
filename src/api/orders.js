import api from './axios'

export const checkout = (data) =>
  api.post('/api/orders/checkout', data)

export const getOrders = () =>
  api.get('/api/orders')

export const getOrderById = (orderId) =>
  api.get(`/api/orders/${orderId}`)

export const cancelOrder = (orderId) =>
  api.post(`/api/orders/${orderId}/cancel`)

export const confirmDelivery = (orderId) =>
  api.post(`/api/orders/${orderId}/confirm-delivery`)

export const getClientSecret = (orderId) =>
  api.get(`/api/orders/${orderId}/client-secret`)

export const disputeOrder = (orderId, reason) =>
    api.post(`/api/orders/${orderId}/dispute`, { reason })
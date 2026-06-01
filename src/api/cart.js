import api from './axios'

export const getCart = () =>
    api.get('/api/cart')

export const addCartItem = (data) =>
    api.post('/api/cart/items', data)

export const updateCartItem = (cartItemId, data) =>
  api.patch(`/api/cart/items/${cartItemId}`, data)

export const removeCartItem = (cartItemId) =>
  api.delete(`/api/cart/items/${cartItemId}`)

export const clearCart = () =>
  api.delete('/api/cart')
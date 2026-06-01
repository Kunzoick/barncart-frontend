import api from './axios'

export const getSlotsByDate = (date) =>
  api.get(`/api/delivery-slots?date=${date}`)

export const getSlotsByRange = (from, to) =>
  api.get(`/api/delivery-slots/range?from=${from}&to=${to}`)
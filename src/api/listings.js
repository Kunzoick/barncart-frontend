import api from './axios'

export const getListings = (page = 0, size = 12) =>
  api.get('/api/listings', { params: { page, size } })

export const getListingById = (id) =>
  api.get(`/api/listings/${id}`)
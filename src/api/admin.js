import api from './axios'

// Orders
export const getAdminOrders = (page = 0, size = 20) =>
  api.get(`/api/admin/orders?page=${page}&size=${size}`)
export const fulfillOrder = (orderId) => api.post(`/api/admin/orders/${orderId}/fulfill`)
export const resolveDispute = (orderId) => api.post(`/api/admin/orders/${orderId}/resolve-dispute`)

// Batches
export const getAdminBatches = () => api.get('/api/admin/batches')
export const createBatch = (data) => api.post('/api/admin/batches', data)
export const cancelBatch = (batchId) => api.patch(`/api/admin/batches/${batchId}/cancel`)
export const restockBatch = (batchId, quantity) => api.patch(`/api/admin/batches/${batchId}/restock`, { quantity })

// Listings
export const getAdminListings = () => api.get('/api/listings')
export const createListing = (data) => api.post('/api/listings', data)
export const deactivateListing = (listingId) => api.patch(`/api/listings/${listingId}/deactivate`)

// Produce
export const getProduce = () => api.get('/api/produce')
export const createProduce = (data) => api.post('/api/produce', data)
export const deactivateProduceItem = (id) => api.patch(`/api/produce/${id}/deactivate`)
export const uploadProduceImage = (id, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/api/produce/${id}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data'}
    })
}

// Categories
export const getCategories = () => api.get('/api/admin/categories')
export const createCategory = (data) => api.post('/api/admin/categories', data)
export const updateCategory = (id, data) => api.put(`/api/admin/categories/${id}`, data)

// Delivery slots
export const getAdminSlots = (from, to) => api.get(`/api/delivery-slots/admin?from=${from}&to=${to}`)
export const createSlot = (data) => api.post('/api/delivery-slots', data)


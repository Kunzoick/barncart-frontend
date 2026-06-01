import api from './axios'

export const loginUser = (data) =>
    api.post('/api/auth/login', data)

export const registerUser = (data) =>
    api.post('/api/auth/register', data)

export const verifyEmail = (data) =>
    api.post('/api/auth/verify-email', data)

export const resendVerification = (data) =>
    api.post('/api/auth/resend-verification', data)

export const forgotPassword = (data) =>
    api.post('/api/auth/forgot-password', data)

export const resetPassword = (data) =>
  api.post('/api/auth/reset-password', data)

export const changePassword = (data) =>
  api.post('/api/auth/change-password', data)
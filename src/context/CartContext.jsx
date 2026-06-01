import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { getCart, addCartItem, updateCartItem, removeCartItem, clearCart } from '../api/cart'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)

  // Fetch cart when user logs in
  useEffect(() => {
    if (user) {
      fetchCart()
    } else {
      setCart(null)
    }
  }, [user])

  const fetchCart = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getCart()
      setCart(res.data)
    } catch (_) {
      setCart(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const addItem = useCallback(async (listingId, quantity) => {
    const res = await addCartItem({ listingId, quantity })
    setCart(res.data)
    return res.data
  }, [])

  const updateItem = useCallback(async (cartItemId, quantity) => {
    const res = await updateCartItem(cartItemId, { quantity })
    setCart(res.data)
    return res.data
  }, [])

  const removeItem = useCallback(async (cartItemId) => {
    const res = await removeCartItem(cartItemId)
    setCart(res.data)
    return res.data
  }, [])

  const emptyCart = useCallback(async () => {
    await clearCart()
    setCart(null)
  }, [])

  const itemCount = cart?.itemCount || 0

  return (
    <CartContext.Provider value={{
      cart, loading, itemCount,
      fetchCart, addItem, updateItem, removeItem, emptyCart
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { useAuth } from './AuthContext'

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const { user, loading: authLoading } = useAuth()
  const [items, setItems] = useState([])
  const [syncedFor, setSyncedFor] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const userId = user?.id
  const loading = !!userId && syncedFor !== userId

  useEffect(() => {
    if (authLoading) return
    if (!userId) { setSyncedFor(null); return setItems([]) }
    let cancelled = false
    api.get('/wishlist')
      .then((d) => !cancelled && setItems(d.products))
      .catch((e) => !cancelled && toast.error(e.message))
      .finally(() => !cancelled && setSyncedFor(userId))
    return () => { cancelled = true }
  }, [userId, authLoading])

  const isWishlisted = useCallback((id) => items.some((p) => p.id === id), [items])

  const toggleWishlist = useCallback(async (product) => {
    if (!userId) {
      toast('Sign in to save your favourites', {
        action: { label: 'Sign in', onClick: () => navigate('/login', { state: { from: location.pathname + location.search } }) },
      })
      return
    }
    const has = items.some((p) => p.id === product.id)
    // optimistic update, roll back on failure
    const before = items
    setItems(has ? items.filter((p) => p.id !== product.id) : [...items, product])
    try {
      const data = has ? await api.delete(`/wishlist/${product.id}`) : await api.post(`/wishlist/${product.id}`)
      setItems(data.products)
      toast.success(has ? 'Removed from wishlist' : 'Saved to wishlist', { description: product.name })
    } catch (e) {
      setItems(before)
      toast.error(e.message)
    }
  }, [userId, items, navigate, location])

  const value = useMemo(
    () => ({ items, toggleWishlist, isWishlisted, count: items.length, loading }),
    [items, toggleWishlist, isWishlisted, loading]
  )
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export const useWishlist = () => useContext(WishlistContext)

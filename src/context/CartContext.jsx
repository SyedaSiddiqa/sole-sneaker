import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)
const GUEST_KEY = 'sole-cart'
const MAX_QTY = 10

const readGuest = () => {
  try { return JSON.parse(localStorage.getItem(GUEST_KEY)) || [] } catch { return [] }
}

/**
 * Cart storage strategy:
 *  - Guests: cart lives in localStorage.
 *  - Signed-in users: cart lives in MongoDB (via /api/cart). On login the guest cart is merged in.
 */
export function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth()
  const [items, setItems] = useState(readGuest)
  const [isOpen, setIsOpen] = useState(false)
  const [syncedFor, setSyncedFor] = useState(null) // user id whose cart has been loaded
  const [busy, setBusy] = useState(false)
  const [lastAdded, setLastAdded] = useState(null)
  const userId = user?.id
  // derived synchronously so pages never flash an empty cart between login and the first fetch
  const loading = !!userId && syncedFor !== userId
  const prevUser = useRef(null)

  // Load the right cart whenever the signed-in user changes
  useEffect(() => {
    if (authLoading) return
    let cancelled = false
    const sync = async () => {
      if (userId) {
        try {
          const guest = readGuest()
          const data = guest.length
            ? await api.post('/cart/merge', { items: guest })
            : await api.get('/cart')
          if (guest.length) localStorage.removeItem(GUEST_KEY)
          if (!cancelled) setItems(data.items)
        } catch (e) {
          if (!cancelled) toast.error(e.message)
        } finally {
          if (!cancelled) setSyncedFor(userId)
        }
      } else {
        setSyncedFor(null)
        if (prevUser.current) setItems([]) // just logged out
        else setItems(readGuest())
      }
      prevUser.current = userId || null
    }
    sync()
    return () => { cancelled = true }
  }, [userId, authLoading])

  // Persist guest cart
  useEffect(() => {
    if (!userId && !authLoading) localStorage.setItem(GUEST_KEY, JSON.stringify(items))
  }, [items, userId, authLoading])

  const guard = async (fn) => {
    setBusy(true)
    try { return await fn() } catch (e) { toast.error(e.message); return false } finally { setBusy(false) }
  }

  const addItem = useCallback(async (product, options = {}) => {
    const color = options.color || product.colors[0]
    const size = Number(options.size || product.sizes[0])
    const qty = options.qty || 1
    if (product.stock !== undefined && product.stock < 1) return toast.error(`${product.name} is out of stock`)

    const done = await guard(async () => {
      if (userId) {
        const data = await api.post('/cart/items', { productId: product.id, color, size, qty })
        setItems(data.items)
        setLastAdded(data.items.find((i) => i.id === product.id && i.color === color && i.size === size)?.lineId)
      } else {
        const lineId = `${product.id}-${color}-${size}`
        setItems((prev) => {
          const existing = prev.find((i) => i.lineId === lineId)
          const next = Math.min((existing?.qty || 0) + qty, MAX_QTY, product.stock ?? MAX_QTY)
          if (existing) return prev.map((i) => (i.lineId === lineId ? { ...i, qty: next } : i))
          return [...prev, { lineId, id: product.id, name: product.name, price: product.price, image: product.image || product.images?.[0], color, size, qty: Math.min(qty, MAX_QTY), stock: product.stock }]
        })
        setLastAdded(lineId)
      }
      return true
    })
    if (done) {
      toast.success(`${product.name} added to bag`, { description: `${color} · Size ${size}` })
      setIsOpen(true)
    }
    return done
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  const removeItem = useCallback((lineId) => guard(async () => {
    if (userId) setItems((await api.delete(`/cart/items/${lineId}`)).items)
    else setItems((prev) => prev.filter((i) => i.lineId !== lineId))
  }), [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  const updateQty = useCallback((lineId, qty) => {
    if (qty < 1) return removeItem(lineId)
    if (qty > MAX_QTY) return toast.info(`Maximum ${MAX_QTY} per item`)
    return guard(async () => {
      if (userId) setItems((await api.patch(`/cart/items/${lineId}`, { qty })).items)
      else setItems((prev) => prev.map((i) => (i.lineId === lineId ? { ...i, qty: Math.min(qty, i.stock ?? MAX_QTY) } : i)))
    })
  }, [userId, removeItem]) // eslint-disable-line react-hooks/exhaustive-deps

  const clearCart = useCallback(async () => {
    if (userId) await api.delete('/cart').catch(() => {})
    setItems([])
  }, [userId])

  // Server clears the cart when an order is placed — just sync local state
  const resetLocal = useCallback(() => setItems([]), [])

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items])
  const shipping = subtotal > 200 || subtotal === 0 ? 0 : 15
  const total = subtotal + shipping
  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items])

  const value = useMemo(
    () => ({ items, addItem, removeItem, updateQty, clearCart, resetLocal, subtotal, shipping, total, count, isOpen, setIsOpen, lastAdded, loading, busy }),
    [items, addItem, removeItem, updateQty, clearCart, resetLocal, subtotal, shipping, total, count, isOpen, lastAdded, loading, busy]
  )
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)

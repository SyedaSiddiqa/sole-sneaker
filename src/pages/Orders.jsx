import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { Package, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import StatusBadge from '@/components/StatusBadge'
import { PageSpinner } from '@/components/ProtectedRoute'
import { api } from '@/lib/api'
import { formatDate, formatPrice, onImgError } from '@/lib/utils'

export default function Orders() {
  const [orders, setOrders] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/orders/mine').then((d) => setOrders(d.orders)).catch((e) => setError(e.message))
  }, [])

  useEffect(() => {
    if (!orders?.length) return
    const t = gsap.fromTo('.order-row', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out' })
    return () => t.kill()
  }, [orders])

  return (
    <div className="pt-36 pb-24 max-w-4xl mx-auto px-6 md:px-10 min-h-screen">
      <div className="mb-12 text-center">
        <span className="text-xs tracking-[0.35em] text-gold uppercase">Account</span>
        <h1 className="font-display text-5xl sm:text-6xl mt-3">MY ORDERS</h1>
      </div>

      {error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : !orders ? (
        <PageSpinner />
      ) : orders.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center">
          <Package size={40} className="text-gold mb-4" />
          <p className="font-display text-2xl mb-2">No orders yet</p>
          <p className="text-text-secondary text-sm mb-6">When you place an order, you can track it here.</p>
          <Button asChild><Link to="/products">Start Shopping</Link></Button>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((o) => (
            <Link key={o.id} to={`/orders/${o.id}`} className="order-row group block rounded-2xl glass p-6 gold-border-anim hover:-translate-y-1 transition-transform duration-300">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                <div>
                  <p className="font-display text-xl">#{o.id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-text-secondary">{formatDate(o.createdAt)} · {o.items.reduce((s, i) => s + i.qty, 0)} items</p>
                </div>
                <StatusBadge status={o.status} />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex -space-x-3">
                  {o.items.slice(0, 4).map((i, k) => (
                    <img key={k} src={i.image} alt={i.name} onError={onImgError} className="h-12 w-12 rounded-full object-cover border-2 border-[var(--card-solid)]" />
                  ))}
                  {o.items.length > 4 && <span className="h-12 w-12 rounded-full bg-gold/20 text-xs flex items-center justify-center border-2 border-[var(--card-solid)]">+{o.items.length - 4}</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-2xl text-gold">{formatPrice(o.totalPrice)}</span>
                  <ChevronRight size={18} className="text-text-secondary group-hover:text-gold group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

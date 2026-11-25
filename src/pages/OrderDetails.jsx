import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import gsap from 'gsap'
import { Check, Package, Truck, Clock, Home, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import StatusBadge from '@/components/StatusBadge'
import { PageSpinner } from '@/components/ProtectedRoute'
import { api } from '@/lib/api'
import { formatDate, formatPrice, onImgError, cn } from '@/lib/utils'

const STEPS = [
  { key: 'Pending', icon: Clock, label: 'Order placed' },
  { key: 'Processing', icon: Package, label: 'Processing' },
  { key: 'Shipped', icon: Truck, label: 'Shipped' },
  { key: 'Delivered', icon: Home, label: 'Delivered' },
]

export default function OrderDetails() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    api.get(`/orders/${id}`).then((d) => setOrder(d.order)).catch((e) => setError(e.status === 403 ? 'You do not have access to this order.' : e.message))
  }, [id])

  const stepIndex = order ? STEPS.findIndex((s) => s.key === order.status) : 0

  useEffect(() => {
    if (!order || order.status === 'Cancelled') return
    const pct = (Math.max(stepIndex, 0) / (STEPS.length - 1)) * 100
    const t = gsap.fromTo('.track-fill', { width: '0%' }, { width: `${pct}%`, duration: 1.2, ease: 'power3.out', delay: 0.2 })
    gsap.fromTo('.track-step', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out' })
    return () => t.kill()
  }, [order, stepIndex])

  const cancel = async () => {
    setCancelling(true)
    try {
      const d = await api.patch(`/orders/${id}/cancel`)
      setOrder(d.order)
      setConfirmOpen(false)
      toast.success('Order cancelled')
    } catch (e) { toast.error(e.message) } finally { setCancelling(false) }
  }

  if (error) return <div className="pt-40 text-center min-h-screen px-6"><p className="font-display text-3xl mb-4">{error}</p><Button asChild><Link to="/orders">Back to orders</Link></Button></div>
  if (!order) return <div className="pt-32"><PageSpinner /></div>

  const cancelled = order.status === 'Cancelled'
  const canCancel = ['Pending', 'Processing'].includes(order.status)

  return (
    <div className="pt-36 pb-24 max-w-5xl mx-auto px-6 md:px-10">
      <Link to="/orders" className="text-xs text-text-secondary hover:text-gold tracking-wide">← All orders</Link>
      <div className="flex items-start justify-between flex-wrap gap-4 mt-4 mb-10">
        <div>
          <h1 className="font-display text-4xl sm:text-5xl">ORDER #{order.id.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-text-secondary mt-1">Placed {formatDate(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} className="text-xs" />
      </div>

      {/* Tracker */}
      <div className="rounded-2xl glass p-6 sm:p-8 mb-8">
        {cancelled ? (
          <div className="flex items-center gap-3 text-red-500"><XCircle size={22} /> <span className="font-semibold">This order was cancelled.</span></div>
        ) : (
          <div className="relative">
            <div className="absolute top-5 left-[12.5%] right-[12.5%] h-[2px] bg-gold/20" />
            <div className="absolute top-5 left-[12.5%] right-[12.5%] h-[2px]"><div className="track-fill h-full bg-gold" style={{ width: 0 }} /></div>
            <div className="relative grid grid-cols-4">
              {STEPS.map((s, i) => {
                const done = i <= stepIndex
                return (
                  <div key={s.key} className="track-step flex flex-col items-center text-center gap-2">
                    <div className={cn('h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors', done ? 'bg-gold border-gold text-black' : 'bg-[var(--card-solid)] border-border text-text-secondary')}>
                      {done && i < stepIndex ? <Check size={16} /> : <s.icon size={16} />}
                    </div>
                    <span className={cn('text-[11px] sm:text-xs tracking-wide', done ? 'text-text font-semibold' : 'text-text-secondary')}>{s.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-8">
        <div className="rounded-2xl glass p-6 sm:p-8">
          <h2 className="font-display text-2xl mb-5">Items</h2>
          <div className="space-y-5">
            {order.items.map((i, k) => (
              <div key={k} className="flex gap-4">
                <div className="h-20 w-20 rounded-xl overflow-hidden shrink-0" style={{ background: 'var(--product-glow)' }}>
                  <img src={i.image} alt={i.name} onError={onImgError} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <Link to={`/products/${i.product}`} className="font-display text-lg hover:text-gold transition-colors">{i.name}</Link>
                  <p className="text-xs text-text-secondary">{i.color} · Size {i.size} × {i.qty}</p>
                </div>
                <span className="font-semibold text-gold">{formatPrice(i.price * i.qty)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border mt-6 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-text-secondary"><span>Subtotal</span><span>{formatPrice(order.itemsPrice)}</span></div>
            <div className="flex justify-between text-text-secondary"><span>Shipping</span><span>{order.shippingPrice === 0 ? 'Free' : formatPrice(order.shippingPrice)}</span></div>
            <div className="flex justify-between font-display text-2xl pt-2"><span>Total</span><span className="text-gold">{formatPrice(order.totalPrice)}</span></div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl glass p-6">
            <h3 className="text-xs font-semibold tracking-widest text-gold uppercase mb-3">Shipping to</h3>
            <p className="text-sm leading-relaxed text-text-secondary">
              <span className="text-text font-medium">{order.customer.name}</span><br />
              {order.shippingAddress.street}<br />{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}<br />{order.shippingAddress.country}<br />{order.customer.phone}
            </p>
          </div>
          <div className="rounded-2xl glass p-6">
            <h3 className="text-xs font-semibold tracking-widest text-gold uppercase mb-3">Payment</h3>
            <p className="text-sm text-text-secondary">Cash on Delivery · <span className={order.isPaid ? 'text-emerald-500' : ''}>{order.isPaid ? 'Paid' : 'Pay on arrival'}</span></p>
          </div>
          <div className="rounded-2xl glass p-6">
            <h3 className="text-xs font-semibold tracking-widest text-gold uppercase mb-3">Timeline</h3>
            <ul className="space-y-2 text-sm">
              {[...order.statusHistory].reverse().map((h, k) => (
                <li key={k} className="flex justify-between text-text-secondary"><span className="text-text">{h.status}</span><span>{formatDate(h.at)}</span></li>
              ))}
            </ul>
          </div>
          {canCancel && <Button variant="outline" className="w-full" onClick={() => setConfirmOpen(true)}>Cancel order</Button>}
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle className="font-display text-2xl mb-2">Cancel this order?</DialogTitle>
          <DialogDescription className="text-sm text-text-secondary mb-6">Your items will be returned to stock. This can't be undone.</DialogDescription>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Keep order</Button>
            <Button onClick={cancel} disabled={cancelling}>{cancelling ? <Loader2 size={15} className="animate-spin" /> : 'Yes, cancel'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

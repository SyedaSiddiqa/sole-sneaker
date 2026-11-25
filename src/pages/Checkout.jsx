import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { Banknote, Loader2, Truck, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import FormField from '@/components/FormField'
import { Button } from '@/components/ui/button'
import { PageSpinner } from '@/components/ProtectedRoute'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { formatPrice, onImgError } from '@/lib/utils'
import { toast } from 'sonner'

const emailRx = /^\S+@\S+\.\S+$/
const phoneRx = /^[+\d][\d\s()-]{6,19}$/

export default function Checkout() {
  const { items, subtotal, shipping, total, resetLocal, loading: cartLoading } = useCart()
  const { user } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '', email: user?.email || '', phone: '',
    street: '', city: '', state: '', zip: '', country: 'United States', notes: '',
  })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [order, setOrder] = useState(null)
  const checkRef = useRef(null)
  const successRef = useRef(null)

  useEffect(() => {
    if (cartLoading || order) return
    const t = gsap.fromTo('.checkout-el', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: 'power3.out' })
    return () => t.kill()
  }, [cartLoading, order, items.length === 0])

  useEffect(() => {
    if (!order || !checkRef.current) return
    gsap.fromTo(successRef.current, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' })
    const path = checkRef.current.querySelector('path')
    const length = path.getTotalLength?.() ?? 60
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })
    gsap.to(path, { strokeDashoffset: 0, duration: 0.8, delay: 0.3, ease: 'power2.out' })
    gsap.fromTo('.success-circle', { scale: 0 }, { scale: 1, duration: 0.5, ease: 'back.out(2)' })
  }, [order])

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((er) => ({ ...er, [k]: '' })) }

  const validate = () => {
    const e = {}
    if (form.name.trim().length < 2) e.name = 'Enter your full name'
    if (!emailRx.test(form.email.trim())) e.email = 'Enter a valid email'
    if (!phoneRx.test(form.phone.trim())) e.phone = 'Enter a valid phone number'
    if (!form.street.trim()) e.street = 'Street address is required'
    if (!form.city.trim()) e.city = 'City is required'
    if (!form.state.trim()) e.state = 'State is required'
    if (!form.zip.trim()) e.zip = 'ZIP is required'
    setErrors(e)
    if (Object.keys(e).length) document.querySelector('[aria-invalid="true"]')?.focus()
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    setServerError('')
    if (!validate()) return
    setSubmitting(true)
    try {
      const { order: created } = await api.post('/orders', {
        customer: { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() },
        shippingAddress: { street: form.street.trim(), city: form.city.trim(), state: form.state.trim(), zip: form.zip.trim(), country: form.country.trim() || 'United States' },
        paymentMethod: 'COD',
        notes: form.notes.trim(),
      })
      resetLocal() // server already emptied the cart
      setOrder(created)
      window.scrollTo({ top: 0 })
    } catch (err) {
      setServerError(err.message)
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (order) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 pt-24">
        <div ref={successRef} className="text-center">
          <div className="success-circle mx-auto mb-8 h-28 w-28 rounded-full bg-gold/10 flex items-center justify-center">
            <svg ref={checkRef} width="52" height="52" viewBox="0 0 52 52" fill="none">
              <path d="M14 27L22 35L38 17" stroke="rgb(var(--gold))" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="font-display text-5xl mb-3">ORDER CONFIRMED</h1>
          <p className="text-gold text-sm tracking-widest mb-4">#{order.id.slice(-8).toUpperCase()}</p>
          <p className="text-text-secondary mb-2 max-w-md mx-auto">Thank you, {order.customer.name.split(' ')[0]}. Your pair is on its way — pay {formatPrice(order.totalPrice)} in cash on delivery.</p>
          <p className="text-text-secondary text-sm mb-10">Delivering to {order.shippingAddress.street}, {order.shippingAddress.city}.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button asChild><Link to={`/orders/${order.id}`}>Track Order</Link></Button>
            <Button asChild variant="outline"><Link to="/products">Continue Shopping</Link></Button>
          </div>
        </div>
      </div>
    )
  }

  if (cartLoading) return <div className="pt-32"><PageSpinner /></div>

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-4xl mb-4">Your bag is empty</h1>
        <p className="text-text-secondary mb-8">Add something to your bag before checking out.</p>
        <Button asChild><Link to="/products">Shop Now</Link></Button>
      </div>
    )
  }

  return (
    <div className="pt-32 pb-24 max-w-6xl mx-auto px-6 md:px-10">
      <h1 className="checkout-el font-display text-5xl mb-12">CHECKOUT</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-14">
        <form onSubmit={handleSubmit} noValidate className="space-y-12">
          <div className="checkout-el">
            <div className="flex items-center gap-2 mb-5"><User size={16} className="text-gold" /><h2 className="font-display text-2xl">Customer Information</h2></div>
            <div className="grid sm:grid-cols-2 gap-5">
              <FormField id="name" value={form.name} onChange={set('name')} error={errors.name} label="Full Name" placeholder="John Doe" autoComplete="name" />
              <FormField id="email" value={form.email} onChange={set('email')} error={errors.email} label="Email" type="email" placeholder="john@example.com" autoComplete="email" />
              <FormField id="phone" value={form.phone} onChange={set('phone')} error={errors.phone} label="Phone" type="tel" placeholder="+1 234 567 890" autoComplete="tel" className="sm:col-span-2" />
            </div>
          </div>

          <div className="checkout-el">
            <div className="flex items-center gap-2 mb-5"><Truck size={16} className="text-gold" /><h2 className="font-display text-2xl">Shipping Address</h2></div>
            <div className="grid gap-5">
              <FormField id="street" value={form.street} onChange={set('street')} error={errors.street} label="Street Address" placeholder="123 Fashion Avenue" autoComplete="street-address" />
              <div className="grid sm:grid-cols-3 gap-5">
                <FormField id="city" value={form.city} onChange={set('city')} error={errors.city} label="City" placeholder="New York" autoComplete="address-level2" />
                <FormField id="state" value={form.state} onChange={set('state')} error={errors.state} label="State" placeholder="NY" autoComplete="address-level1" />
                <FormField id="zip" value={form.zip} onChange={set('zip')} error={errors.zip} label="ZIP Code" placeholder="10001" autoComplete="postal-code" />
              </div>
              <FormField id="country" value={form.country} onChange={set('country')} error={errors.country} label="Country" autoComplete="country-name" />
              <div>
                <Label htmlFor="notes">Delivery notes (optional)</Label>
                <Textarea id="notes" value={form.notes} onChange={set('notes')} maxLength={500} placeholder="Gate code, preferred delivery time…" className="mt-2 min-h-[90px]" />
              </div>
            </div>
          </div>

          <div className="checkout-el">
            <div className="flex items-center gap-2 mb-5"><Banknote size={16} className="text-gold" /><h2 className="font-display text-2xl">Payment Method</h2></div>
            <label className="flex items-center gap-4 rounded-xl border border-gold bg-gold/5 p-5 cursor-pointer">
              <input type="radio" checked readOnly className="accent-[rgb(var(--gold))] h-4 w-4" />
              <div>
                <p className="font-semibold text-sm">Cash on Delivery</p>
                <p className="text-xs text-text-secondary">Pay in cash when your order arrives. No card needed.</p>
              </div>
            </label>
          </div>

          {serverError && <p role="alert" className="text-sm text-red-500 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">{serverError}</p>}

          <Button type="submit" size="lg" className="w-full checkout-el" disabled={submitting}>
            {submitting ? <><Loader2 size={16} className="animate-spin" /> PLACING ORDER…</> : `PLACE ORDER · ${formatPrice(total)}`}
          </Button>
        </form>

        <div className="checkout-el h-fit rounded-2xl glass p-7 lg:sticky lg:top-28">
          <h3 className="font-display text-2xl mb-6">Order Summary</h3>
          <div className="space-y-4 max-h-72 overflow-y-auto no-scrollbar mb-6">
            {items.map((item) => (
              <div key={item.lineId} className="flex gap-3">
                <div className="h-16 w-16 rounded-lg overflow-hidden shrink-0" style={{ background: 'var(--product-glow)' }}>
                  <img src={item.image} alt={item.name} onError={onImgError} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-text-secondary">{item.color} · Size {item.size} × {item.qty}</p>
                </div>
                <span className="text-sm text-gold font-semibold">{formatPrice(item.price * item.qty)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 border-t border-border pt-4">
            <div className="flex justify-between text-sm text-text-secondary"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between text-sm text-text-secondary"><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
            <div className="flex justify-between font-display text-2xl pt-2"><span>Total</span><span className="text-gold">{formatPrice(total)}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}

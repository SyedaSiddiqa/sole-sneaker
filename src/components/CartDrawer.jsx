import { useNavigate, useLocation } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, Loader2 } from 'lucide-react'
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { formatPrice, onImgError } from '@/lib/utils'

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQty, removeItem, subtotal, shipping, total, loading, busy } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleCheckout = () => {
    setIsOpen(false)
    if (!user) navigate('/login', { state: { from: '/checkout' } })
    else navigate('/checkout')
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="p-6">
        <SheetTitle className="font-display text-2xl tracking-wide mb-1">Your Bag</SheetTitle>
        <SheetDescription className="sr-only">Items in your shopping bag</SheetDescription>
        <div className="mb-6" />

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-gold"><Loader2 className="animate-spin" /></div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-text-secondary gap-4">
            <ShoppingBag size={40} className="text-gold" />
            <p className="font-display text-xl text-text">Your bag is empty</p>
            <p className="text-sm max-w-[220px]">Find your next pair and it will show up here.</p>
            <Button variant="outline" onClick={() => { setIsOpen(false); if (location.pathname !== '/products') navigate('/products') }}>Browse Sneakers</Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-5 pr-1">
              {items.map((item) => (
                <div key={item.lineId} className="flex gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="h-20 w-20 rounded-xl overflow-hidden shrink-0" style={{ background: 'var(--product-glow)' }}>
                    <img src={item.image} alt={item.name} onError={onImgError} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-display text-lg leading-tight">{item.name}</p>
                        <p className="text-xs text-text-secondary">{item.color} · Size {item.size}</p>
                      </div>
                      <button onClick={() => removeItem(item.lineId)} disabled={busy} aria-label="Remove item" className="text-text-secondary hover:text-red-500 transition-colors shrink-0 disabled:opacity-40">
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 border border-border rounded-full px-2 py-1">
                        <button onClick={() => updateQty(item.lineId, item.qty - 1)} disabled={busy} aria-label="Decrease" className="text-text-secondary hover:text-gold disabled:opacity-40"><Minus size={13} /></button>
                        <span className="text-sm w-4 text-center">{item.qty}</span>
                        <button onClick={() => updateQty(item.lineId, item.qty + 1)} disabled={busy || item.qty >= (item.stock ?? 10)} aria-label="Increase" className="text-text-secondary hover:text-gold disabled:opacity-40"><Plus size={13} /></button>
                      </div>
                      <span className="font-semibold text-gold">{formatPrice(item.price * item.qty)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-5 mt-5 space-y-2">
              <div className="flex justify-between text-sm text-text-secondary"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between text-sm text-text-secondary"><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
              {shipping > 0 && <p className="text-[11px] text-gold">Add {formatPrice(200.01 - subtotal)} more for free shipping</p>}
              <div className="flex justify-between font-display text-xl pt-2"><span>Total</span><span className="text-gold">{formatPrice(total)}</span></div>
              <div className="flex gap-3 pt-3">
                <Button variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>Continue Shopping</Button>
                <Button className="flex-1" onClick={handleCheckout}>Checkout</Button>
              </div>
              {!user && <p className="text-[11px] text-center text-text-secondary pt-1">You'll be asked to sign in to place your order.</p>}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

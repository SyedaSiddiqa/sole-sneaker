import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useCart } from '@/context/CartContext'
import { formatPrice, cn, onImgError } from '@/lib/utils'
import { colorMap } from '@/data/products'

export default function QuickView({ product, open, onOpenChange }) {
  const [color, setColor] = useState(product.colors[0])
  const [size, setSize] = useState(null)
  const [error, setError] = useState('')
  const { addItem, busy } = useCart()
  const soldOut = product.stock < 1

  const handleAdd = async () => {
    if (!size) return setError('Please select a size')
    const ok = await addItem(product, { color, size, qty: 1 })
    if (ok) onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        <DialogDescription className="sr-only">Quick view for {product.name}</DialogDescription>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-xl overflow-hidden h-64 md:h-full min-h-[260px]" style={{ background: 'var(--product-glow)' }}>
            <img src={product.image} alt={product.name} onError={onImgError} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs tracking-widest text-gold uppercase mb-1">{product.category}</span>
            <h2 className="font-display text-3xl mb-2">{product.name}</h2>
            <div className="flex items-center gap-1 text-sm text-gold mb-4">
              <Star size={14} className="fill-gold" /> {product.rating?.toFixed(1)} rating
            </div>
            <p className="font-display text-3xl text-gold mb-5">{formatPrice(product.price)}</p>

            <div className="mb-4">
              <p className="text-xs font-semibold tracking-widest text-text-secondary uppercase mb-2">Color: {color}</p>
              <div className="flex gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    aria-label={c}
                    className={cn('h-8 w-8 rounded-full border-2 transition-all', color === c ? 'border-gold scale-110' : 'border-border')}
                    style={{ background: colorMap[c] }}
                  />
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className={cn('text-xs font-semibold tracking-widest uppercase mb-2', error ? 'text-red-500' : 'text-text-secondary')}>
                {error || `Size: ${size ?? 'select'}`}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSize(s); setError('') }}
                    className={cn(
                      'h-9 w-11 rounded-lg border text-sm transition-all',
                      size === s ? 'border-gold bg-gold text-black font-semibold' : 'border-border hover:border-gold'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto flex gap-3">
              <Button onClick={handleAdd} disabled={busy || soldOut} className="flex-1">
                {soldOut ? 'Sold Out' : busy ? 'Adding…' : 'Add to Cart'}
              </Button>
              <Button asChild variant="outline">
                <Link to={`/products/${product.id}`} onClick={() => onOpenChange(false)}>Details</Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

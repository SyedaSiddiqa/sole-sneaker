import { useEffect, useRef, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { Star, Heart, Minus, Plus, ZoomIn, ZoomOut, Box, Image as ImageIcon, PackageX } from 'lucide-react'
import Hero3D from '@/components/Hero3D'
import ProductGrid from '@/components/ProductGrid'
import { PageSpinner } from '@/components/ProtectedRoute'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { useWishlist } from '@/context/WishlistContext'
import { api } from '@/lib/api'
import { formatPrice, cn, onImgError } from '@/lib/utils'
import { colorMap } from '@/data/products'

export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem, busy } = useCart()
  const { user } = useAuth()
  const { toggleWishlist, isWishlisted } = useWishlist()
  const pageRef = useRef(null)

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | missing | error
  const [color, setColor] = useState(null)
  const [size, setSize] = useState(null)
  const [sizeError, setSizeError] = useState(false)
  const [qty, setQty] = useState(1)
  const [view, setView] = useState('3d') // '3d' | image index
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    const ctrl = new AbortController()
    setStatus('loading'); setProduct(null); setSize(null); setQty(1); setView('3d'); setZoom(1); setSizeError(false)
    Promise.all([api.get(`/products/${id}`, { signal: ctrl.signal }), api.get(`/products/${id}/related`, { signal: ctrl.signal })])
      .then(([p, r]) => {
        setProduct(p.product); setRelated(r.products); setColor(p.product.colors[0]); setStatus('ready')
      })
      .catch((e) => {
        if (e.name === 'AbortError') return
        setStatus(e.status === 404 || e.status === 400 ? 'missing' : 'error')
      })
    return () => ctrl.abort()
  }, [id])

  useEffect(() => {
    if (status !== 'ready') return
    const tween = gsap.fromTo('.pdp-el', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: 'power3.out' })
    return () => tween.kill()
  }, [status, id])

  if (status === 'loading') return <div className="pt-32"><PageSpinner /></div>
  if (status !== 'ready') {
    return (
      <div className="pt-40 pb-24 text-center flex flex-col items-center px-6">
        <PackageX size={40} className="text-gold mb-4" />
        <p className="font-display text-3xl mb-2">{status === 'missing' ? 'Product not found' : 'Could not load product'}</p>
        <p className="text-text-secondary mb-6 text-sm">{status === 'missing' ? 'This sneaker may have been removed.' : 'Please check your connection and try again.'}</p>
        <Button onClick={() => navigate('/products')}>Back to Shop</Button>
      </div>
    )
  }

  const wished = isWishlisted(product.id)
  const soldOut = product.stock < 1
  const maxQty = Math.min(10, product.stock)

  const requireSize = () => {
    if (!size) { setSizeError(true); return false }
    return true
  }
  const handleAdd = () => requireSize() && addItem(product, { color, size, qty })
  const handleBuyNow = async () => {
    if (!requireSize()) return
    const ok = await addItem(product, { color, size, qty })
    if (ok) navigate(user ? '/checkout' : '/login', { state: { from: '/checkout' } })
  }

  return (
    <div ref={pageRef} className="pt-32 pb-24 max-w-7xl mx-auto px-6 md:px-10">
      <nav className="pdp-el text-xs text-text-secondary mb-8 tracking-wide">
        <Link to="/products" className="hover:text-gold">Shop</Link> / <Link to={`/products?category=${product.category}`} className="hover:text-gold">{product.category}</Link> / <span className="text-text">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
        {/* Left: 3D / images */}
        <div className="pdp-el">
          <div className="relative h-[420px] sm:h-[520px] rounded-3xl overflow-hidden glass mb-4">
            {view === '3d' ? (
              <Hero3D zoom={zoom} />
            ) : (
              <img src={product.images[view]} alt={product.name} onError={onImgError} className="w-full h-full object-cover animate-in fade-in duration-500" />
            )}
            {view === '3d' && (
              <div className="absolute bottom-4 left-4 flex gap-2">
                <button onClick={() => setZoom((z) => Math.min(z + 0.25, 1.75))} aria-label="Zoom in" className="h-10 w-10 rounded-full glass flex items-center justify-center hover:bg-gold hover:text-black transition-colors"><ZoomIn size={16} /></button>
                <button onClick={() => setZoom((z) => Math.max(z - 0.25, 0.7))} aria-label="Zoom out" className="h-10 w-10 rounded-full glass flex items-center justify-center hover:bg-gold hover:text-black transition-colors"><ZoomOut size={16} /></button>
              </div>
            )}
            {product.tag && <span className="absolute top-4 left-4 bg-btn-bg text-btn-text text-[10px] font-bold tracking-widest px-3 py-1 rounded-full uppercase">{product.tag}</span>}
          </div>
          <div className="grid grid-cols-4 gap-3">
            <button onClick={() => setView('3d')} aria-label="3D view" className={cn('rounded-xl h-20 glass flex flex-col items-center justify-center gap-1 text-[10px] tracking-widest uppercase transition-all', view === '3d' ? 'border-gold ring-1 ring-gold text-gold' : 'text-text-secondary hover:text-gold')}>
              <Box size={18} /> 3D
            </button>
            {product.images.slice(0, 3).map((img, i) => (
              <button key={i} onClick={() => setView(i)} aria-label={`Image ${i + 1}`} className={cn('rounded-xl overflow-hidden h-20 transition-all', view === i ? 'ring-2 ring-gold' : 'opacity-70 hover:opacity-100')}>
                <img src={img} alt="" loading="lazy" onError={onImgError} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: info */}
        <div className="pdp-el">
          <span className="text-xs tracking-[0.3em] text-gold uppercase">{product.category}</span>
          <h1 className="font-display text-5xl mt-2 mb-3">{product.name}</h1>
          <div className="flex items-center gap-2 mb-5">
            {[...Array(5)].map((_, i) => <Star key={i} size={15} className={i < Math.round(product.rating) ? 'fill-gold text-gold' : 'text-border'} />)}
            <span className="text-sm text-text-secondary">{product.rating?.toFixed(1)} · {product.numReviews} reviews</span>
          </div>
          <p className="font-display text-4xl text-gold mb-2">{formatPrice(product.price)}</p>
          <p className={cn('text-xs mb-6', soldOut ? 'text-red-500' : product.stock <= 5 ? 'text-gold' : 'text-text-secondary')}>
            {soldOut ? 'Sold out' : product.stock <= 5 ? `Only ${product.stock} left in stock` : 'In stock · ships in 1–2 business days'}
          </p>
          <p className="text-text-secondary leading-relaxed mb-8 max-w-md">{product.description}</p>

          <div className="mb-6">
            <p className="text-xs font-semibold tracking-widest text-text-secondary uppercase mb-3">Color: {color}</p>
            <div className="flex gap-3">
              {product.colors.map((c) => (
                <button key={c} onClick={() => setColor(c)} aria-label={c} className={cn('h-9 w-9 rounded-full border-2 transition-all', color === c ? 'border-gold scale-110' : 'border-border')} style={{ background: colorMap[c] }} />
              ))}
            </div>
          </div>

          <div className="mb-8">
            <p className={cn('text-xs font-semibold tracking-widest uppercase mb-3', sizeError ? 'text-red-500' : 'text-text-secondary')}>
              {sizeError ? 'Please select a size' : `Size: ${size ?? 'select'}`}
            </p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button key={s} onClick={() => { setSize(s); setSizeError(false) }} className={cn('h-10 w-12 rounded-lg border text-sm transition-all', size === s ? 'border-gold bg-gold text-black font-semibold' : sizeError ? 'border-red-500/60' : 'border-border hover:border-gold')}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-3 border border-border rounded-full px-4 py-2">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity"><Minus size={14} /></button>
              <span className="w-5 text-center">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(maxQty, q + 1))} aria-label="Increase quantity" disabled={qty >= maxQty}><Plus size={14} /></button>
            </div>
            <button onClick={() => toggleWishlist(product)} aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'} className="h-11 w-11 rounded-full border border-border flex items-center justify-center hover:border-gold transition-colors">
              <Heart size={16} className={wished ? 'fill-gold text-gold' : ''} />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button className="flex-1" size="lg" disabled={soldOut || busy} onClick={handleAdd}>{soldOut ? 'SOLD OUT' : 'ADD TO CART'}</Button>
            <Button variant="outline" size="lg" className="flex-1" disabled={soldOut || busy} onClick={handleBuyNow}>BUY NOW</Button>
          </div>
        </div>
      </div>

      <div className="pdp-el mt-24">
        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="details">
            <Accordion type="single" collapsible defaultValue="materials" className="max-w-2xl">
              <AccordionItem value="materials">
                <AccordionTrigger>Materials</AccordionTrigger>
                <AccordionContent>Premium engineered upper, responsive foam midsole, and a durable rubber outsole designed for all-day comfort and long-term wear.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="size-guide">
                <AccordionTrigger>Size Guide</AccordionTrigger>
                <AccordionContent>SOLE footwear runs true to EU sizing. Between sizes? We recommend sizing up for a more relaxed fit.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="care">
                <AccordionTrigger>Care Instructions</AccordionTrigger>
                <AccordionContent>Wipe clean with a soft, damp cloth. Avoid direct heat and prolonged sun exposure to preserve materials and color.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
          <TabsContent value="shipping">
            <p className="text-text-secondary max-w-2xl leading-relaxed">Free standard shipping on orders over $200, otherwise a flat $15. Orders are processed within 1–2 business days and arrive within 3–7 business days. Payment is Cash on Delivery.</p>
          </TabsContent>
          <TabsContent value="reviews">
            <div className="space-y-6 max-w-2xl">
              <p className="text-sm text-text-secondary">Rated <span className="text-gold font-semibold">{product.rating?.toFixed(1)}</span> / 5 from {product.numReviews} verified buyers.</p>
              {['Incredible fit and finish — feels like a true premium product.', 'Comfortable from the first wear. Worth every cent.'].map((t, i) => (
                <div key={i} className="border-b border-border pb-6">
                  <div className="flex items-center gap-1 mb-2">{[...Array(5)].map((_, k) => <Star key={k} size={13} className="fill-gold text-gold" />)}</div>
                  <p className="text-sm text-text-secondary">“{t}”</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {related.length > 0 && (
        <div className="mt-24">
          <h3 className="font-display text-3xl mb-8">You May Also Like</h3>
          <ProductGrid products={related} />
        </div>
      )}
    </div>
  )
}

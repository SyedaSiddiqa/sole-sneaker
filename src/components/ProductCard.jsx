import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react'
import { useWishlist } from '@/context/WishlistContext'
import { formatPrice, cn, onImgError } from '@/lib/utils'
import { colorMap } from '@/data/products'
import QuickView from './QuickView'

export default function ProductCard({ product }) {
  const cardRef = useRef(null)
  const imgRef = useRef(null)
  const detailsRef = useRef(null)
  const { toggleWishlist, isWishlisted } = useWishlist()
  const [quickViewOpen, setQuickViewOpen] = useState(false)
  const wished = isWishlisted(product.id)
  const soldOut = product.stock < 1

  const handleEnter = () => {
    gsap.to(cardRef.current, { y: -10, boxShadow: '0 25px 50px -12px rgb(var(--gold) / 0.25)', duration: 0.45, ease: 'power2.out' })
    gsap.to(imgRef.current, { scale: 1.08, duration: 0.55, ease: 'power2.out' })
    gsap.to(detailsRef.current, { y: -4, duration: 0.4, ease: 'power2.out' })
  }
  const handleLeave = () => {
    gsap.to(cardRef.current, { y: 0, boxShadow: '0 0px 0px 0 rgba(0,0,0,0)', duration: 0.45, ease: 'power2.out' })
    gsap.to(imgRef.current, { scale: 1, duration: 0.55, ease: 'power2.out' })
    gsap.to(detailsRef.current, { y: 0, duration: 0.4, ease: 'power2.out' })
  }

  const openQuickView = (e) => {
    e.preventDefault()
    setQuickViewOpen(true)
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    toggleWishlist(product)
    gsap.fromTo(e.currentTarget, { scale: 1 }, { scale: 1.4, duration: 0.2, yoyo: true, repeat: 1, ease: 'power2.out' })
  }

  return (
    <>
      <div
        ref={cardRef}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        className="product-card group relative rounded-2xl glass overflow-hidden gold-border-anim transition-shadow"
      >
        <Link to={`/products/${product.id}`} className="block">
          <div className="relative h-64 overflow-hidden" style={{ background: 'var(--product-glow)' }}>
            <img ref={imgRef} src={product.image} alt={product.name} loading="lazy" onError={onImgError} className="w-full h-full object-cover" />
            {(soldOut || product.tag) && (
              <span className="absolute top-3 left-3 bg-btn-bg text-btn-text text-[10px] font-bold tracking-widest px-3 py-1 rounded-full uppercase">
                {soldOut ? 'Sold out' : product.tag}
              </span>
            )}
            <button
              onClick={handleWishlist}
              className="absolute top-3 right-3 h-9 w-9 rounded-full glass flex items-center justify-center transition-colors"
              aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={15} className={cn(wished ? 'fill-gold text-gold' : 'text-text')} />
            </button>
            <button
              onClick={openQuickView}
              className="absolute bottom-3 right-3 h-9 px-3 rounded-full glass flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-gold hover:text-black transition-all duration-300 max-md:opacity-100 max-md:translate-y-0"
              aria-label="Quick view"
            >
              <Eye size={13} /> Quick view
            </button>
          </div>

          <div ref={detailsRef} className="p-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] tracking-widest text-text-secondary uppercase">{product.category}</span>
              <div className="flex items-center gap-1 text-xs text-gold">
                <Star size={12} className="fill-gold" /> {product.rating?.toFixed(1)}
              </div>
            </div>
            <h3 className="font-display text-xl mb-2">{product.name}</h3>
            <div className="flex items-center gap-1.5 mb-3">
              {product.colors.map((c) => (
                <span key={c} className="h-3.5 w-3.5 rounded-full border border-border" style={{ background: colorMap[c] }} title={c} />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="font-display text-2xl text-gold">{formatPrice(product.price)}</span>
              <button
                onClick={openQuickView}
                disabled={soldOut}
                className="h-10 w-10 rounded-full bg-btn-bg text-btn-text flex items-center justify-center hover:brightness-110 hover:scale-110 transition-all disabled:opacity-40 disabled:hover:scale-100"
                aria-label="Choose size and add to cart"
              >
                <ShoppingBag size={15} />
              </button>
            </div>
          </div>
        </Link>
      </div>
      {quickViewOpen && <QuickView product={product} open={quickViewOpen} onOpenChange={setQuickViewOpen} />}
    </>
  )
}

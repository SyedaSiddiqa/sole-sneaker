import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import ProductGrid from '@/components/ProductGrid'
import { Button } from '@/components/ui/button'
import { useWishlist } from '@/context/WishlistContext'

export default function Wishlist() {
  const { items, loading } = useWishlist()
  return (
    <div className="pt-36 pb-24 max-w-7xl mx-auto px-6 md:px-10">
      <div className="mb-12 text-center">
        <span className="text-xs tracking-[0.35em] text-gold uppercase">Saved</span>
        <h1 className="font-display text-5xl sm:text-6xl mt-3">YOUR WISHLIST</h1>
        {!loading && items.length > 0 && <p className="text-text-secondary mt-3">{items.length} saved {items.length === 1 ? 'pair' : 'pairs'}</p>}
      </div>
      <ProductGrid
        products={items}
        loading={loading}
        emptyTitle="Your wishlist is empty"
        emptyText="Tap the heart on any sneaker to save it here."
        emptyAction={<Button asChild><Link to="/products"><Heart size={15} /> Discover Sneakers</Link></Button>}
      />
    </div>
  )
}

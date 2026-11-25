import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { SearchX } from 'lucide-react'
import ProductCard from './ProductCard'

function Skeleton() {
  return (
    <div className="rounded-2xl glass overflow-hidden animate-pulse">
      <div className="h-64 bg-gold/10" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-1/3 rounded bg-gold/10" />
        <div className="h-5 w-2/3 rounded bg-gold/10" />
        <div className="h-3 w-1/4 rounded bg-gold/10" />
        <div className="h-8 w-full rounded bg-gold/10" />
      </div>
    </div>
  )
}

export default function ProductGrid({ products, loading = false, skeletons = 6, emptyTitle = 'No products found', emptyText = 'Try adjusting your filters.', emptyAction }) {
  const gridRef = useRef(null)

  useEffect(() => {
    if (loading) return
    const cards = gridRef.current?.querySelectorAll('.product-card')
    if (!cards || cards.length === 0) return
    const tween = gsap.fromTo(cards, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.06, ease: 'power3.out' })
    return () => tween.kill()
  }, [products, loading])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: skeletons }).map((_, i) => <Skeleton key={i} />)}
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-24 text-text-secondary flex flex-col items-center">
        <SearchX size={36} className="text-gold mb-4" />
        <p className="font-display text-2xl mb-2 text-text">{emptyTitle}</p>
        <p className="text-sm mb-6">{emptyText}</p>
        {emptyAction}
      </div>
    )
  }

  return (
    <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  )
}

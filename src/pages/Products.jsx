import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import gsap from 'gsap'
import { SlidersHorizontal, ChevronLeft, ChevronRight, X } from 'lucide-react'
import FilterSidebar from '@/components/FilterSidebar'
import ProductGrid from '@/components/ProductGrid'
import TrustFeatures from '@/components/TrustFeatures'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { api, toQuery } from '@/lib/api'

const PAGE_SIZE = 9
const DEFAULT_FILTERS = { category: 'All', price: [50, 350], colors: [], sizes: [] }

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Best Rated' },
]

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS, category: searchParams.get('category') || 'All' })
  const [debouncedPrice, setDebouncedPrice] = useState(DEFAULT_FILTERS.price)
  const [sort, setSort] = useState('featured')
  const [page, setPage] = useState(1)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [data, setData] = useState({ products: [], total: 0, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const search = searchParams.get('search') || ''
  const firstRender = useRef(true)

  // keep category in sync if the URL changes (e.g. footer "Shop" links)
  const urlCategory = searchParams.get('category')
  useEffect(() => {
    if (urlCategory && urlCategory !== filters.category) setFilters((f) => ({ ...f, category: urlCategory }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlCategory])

  useEffect(() => {
    gsap.fromTo('.products-hero-el', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out' })
  }, [])

  // debounce the price slider so we don't hit the API on every pixel
  useEffect(() => {
    const t = setTimeout(() => setDebouncedPrice(filters.price), 300)
    return () => clearTimeout(t)
  }, [filters.price])

  // any filter change returns to page 1
  useEffect(() => setPage(1), [filters.category, filters.colors, filters.sizes, debouncedPrice, sort, search])

  // fetch from MongoDB via the API
  useEffect(() => {
    const ctrl = new AbortController()
    setLoading(true)
    setError('')
    const qs = toQuery({
      search,
      category: filters.category === 'All' ? '' : filters.category,
      minPrice: debouncedPrice[0] > 50 ? debouncedPrice[0] : '',
      maxPrice: debouncedPrice[1] < 350 ? debouncedPrice[1] : '',
      colors: filters.colors,
      sizes: filters.sizes,
      sort,
      page,
      limit: PAGE_SIZE,
    })
    api.get(`/products?${qs}`, { signal: ctrl.signal })
      .then((d) => { setData(d); setLoading(false) })
      .catch((e) => { if (e.name !== 'AbortError') { setError(e.message); setLoading(false) } })
    return () => ctrl.abort()
  }, [search, filters.category, filters.colors, filters.sizes, debouncedPrice, sort, page])

  const handleClear = () => {
    setFilters({ ...DEFAULT_FILTERS })
    setDebouncedPrice(DEFAULT_FILTERS.price)
    setSort('featured')
    setSearchParams({})
  }

  const goToPage = (p) => {
    if (p < 1 || p > data.pages) return
    setPage(p)
    document.getElementById('products-top')?.scrollIntoView({ behavior: firstRender.current ? 'auto' : 'smooth', block: 'start' })
  }

  const activeFilters =
    (filters.category !== 'All') + filters.colors.length + filters.sizes.length + (filters.price[0] > 50 || filters.price[1] < 350) + !!search

  return (
    <div>
      <section id="products-top" className="pt-36 pb-14 max-w-7xl mx-auto px-6 md:px-10 text-center">
        <span className="products-hero-el inline-block text-xs tracking-[0.35em] text-gold uppercase mb-4">Collection</span>
        <h1 className="products-hero-el font-display text-5xl sm:text-6xl md:text-7xl mb-4">SHOP ALL</h1>
        <p className="products-hero-el text-text-secondary">{search ? `Results for “${search}”` : 'Explore the SOLE collection.'}</p>
      </section>

      <section className="max-w-7xl mx-auto px-6 md:px-10 pb-24">
        <div className="flex items-center justify-between mb-8 gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileFiltersOpen(true)} className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm">
              <SlidersHorizontal size={14} /> Filters{activeFilters > 0 && <span className="bg-gold text-black text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">{activeFilters}</span>}
            </button>
            <p className="text-sm text-text-secondary" aria-live="polite" data-testid="product-count">
              <span className="text-text font-semibold">{loading ? '…' : data.total}</span> {data.total === 1 ? 'Product' : 'Products'}
            </p>
            {activeFilters > 0 && (
              <button onClick={handleClear} className="text-xs text-gold hover:underline flex items-center gap-1"><X size={12} /> Clear all filters</button>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm hover:border-gold transition-colors">
              Sort: {sortOptions.find((o) => o.value === sort)?.label}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {sortOptions.map((o) => <DropdownMenuItem key={o.value} onClick={() => setSort(o.value)}>{o.label}</DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10">
          <FilterSidebar filters={filters} setFilters={setFilters} onClear={handleClear} className="hidden lg:block" />

          <div>
            <ProductGrid
              products={data.products}
              loading={loading}
              skeletons={PAGE_SIZE}
              emptyTitle={error ? 'Something went wrong' : 'No sneakers match your filters'}
              emptyText={error || 'Try removing a filter or searching for something else.'}
              emptyAction={!error && <Button variant="outline" onClick={handleClear}>Clear All Filters</Button>}
            />

            {!loading && data.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-16 flex-wrap">
                <button onClick={() => goToPage(page - 1)} disabled={page === 1} aria-label="Previous page" className="h-10 px-4 rounded-full border border-border flex items-center gap-1 text-sm disabled:opacity-30 hover:border-gold transition-colors">
                  <ChevronLeft size={15} /> <span className="hidden sm:inline">Previous</span>
                </button>
                {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => goToPage(p)} aria-current={p === page} className={`h-10 w-10 rounded-full text-sm transition-all ${p === page ? 'bg-gold text-black font-semibold' : 'border border-border hover:border-gold'}`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => goToPage(page + 1)} disabled={page === data.pages} aria-label="Next page" className="h-10 px-4 rounded-full border border-border flex items-center gap-1 text-sm disabled:opacity-30 hover:border-gold transition-colors">
                  <span className="hidden sm:inline">Next</span> <ChevronRight size={15} />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm glass p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
            <button onClick={() => setMobileFiltersOpen(false)} className="absolute top-5 right-5 text-text-secondary" aria-label="Close filters"><X size={18} /></button>
            <FilterSidebar filters={filters} setFilters={setFilters} onClear={handleClear} />
            <Button className="w-full mt-8" onClick={() => setMobileFiltersOpen(false)}>Show {data.total} results</Button>
          </div>
        </div>
      )}

      <TrustFeatures />
    </div>
  )
}

import { Slider } from '@/components/ui/slider'
import { allCategories, allColors, allSizes } from '@/data/products'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

const colorMap = { Black: '#171717', White: '#f5f5f5', Gold: '#D4AF37', Red: '#b91c1c', Blue: '#1d4ed8' }

export default function FilterSidebar({ filters, setFilters, onClear, className }) {
  const toggleColor = (c) => {
    setFilters((f) => ({
      ...f,
      colors: f.colors.includes(c) ? f.colors.filter((x) => x !== c) : [...f.colors, c],
    }))
  }
  const toggleSize = (s) => {
    setFilters((f) => ({
      ...f,
      sizes: f.sizes.includes(s) ? f.sizes.filter((x) => x !== s) : [...f.sizes, s],
    }))
  }

  return (
    <aside className={cn('space-y-8', className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl tracking-wide">Filters</h3>
        <button onClick={onClear} className="text-xs text-gold hover:underline flex items-center gap-1">
          <X size={12} /> Clear All
        </button>
      </div>

      <div>
        <p className="text-xs font-semibold tracking-widest text-text-secondary uppercase mb-3">Category</p>
        <div className="space-y-2">
          {allCategories.map((c) => (
            <button
              key={c}
              onClick={() => setFilters((f) => ({ ...f, category: c }))}
              className={cn(
                'block w-full text-left px-3 py-2 rounded-lg text-sm transition-all',
                filters.category === c ? 'bg-gold text-black font-semibold' : 'text-text-secondary hover:bg-gold/10 hover:text-text'
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold tracking-widest text-text-secondary uppercase mb-4">
          Price Range — ${filters.price[0]} — ${filters.price[1]}
        </p>
        <Slider
          min={50}
          max={350}
          step={5}
          value={filters.price}
          onValueChange={(val) => setFilters((f) => ({ ...f, price: val }))}
        />
      </div>

      <div>
        <p className="text-xs font-semibold tracking-widest text-text-secondary uppercase mb-3">Colors</p>
        <div className="flex flex-wrap gap-3">
          {allColors.map((c) => (
            <button
              key={c}
              onClick={() => toggleColor(c)}
              title={c}
              className={cn(
                'h-8 w-8 rounded-full border-2 transition-all',
                filters.colors.includes(c) ? 'border-gold scale-110' : 'border-border'
              )}
              style={{ background: colorMap[c] }}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold tracking-widest text-text-secondary uppercase mb-3">Size</p>
        <div className="flex flex-wrap gap-2">
          {allSizes.map((s) => (
            <button
              key={s}
              onClick={() => toggleSize(s)}
              className={cn(
                'h-9 w-11 rounded-lg border text-sm transition-all',
                filters.sizes.includes(s) ? 'border-gold bg-gold text-black font-semibold' : 'border-border hover:border-gold'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}

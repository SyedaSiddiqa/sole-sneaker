import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import FormField from '@/components/FormField'
import { allColors, allSizes, productCategories, colorMap } from '@/data/products'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

const empty = { name: '', category: 'Running', price: '', stock: 50, tag: '', featured: false, colors: [], sizes: [], images: '', description: '' }

const toggle = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])

export default function ProductFormDialog({ open, onOpenChange, product, onSaved }) {
  const [f, setF] = useState(empty)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState('')
  const editing = !!product

  useEffect(() => {
    if (!open) return
    setErrors({}); setServerError('')
    setF(product ? { ...product, images: product.images.join('\n'), tag: product.tag || '' } : empty)
  }, [open, product])

  const set = (k) => (e) => { setF((s) => ({ ...s, [k]: e.target.value })); setErrors((er) => ({ ...er, [k]: '' })) }
  const imageList = f.images.split('\n').map((s) => s.trim()).filter(Boolean)

  const validate = () => {
    const e = {}
    if (!f.name.trim()) e.name = 'Name is required'
    if (!(Number(f.price) >= 1)) e.price = 'Price must be at least 1'
    if (!(Number.isInteger(Number(f.stock)) && Number(f.stock) >= 0)) e.stock = 'Whole number ≥ 0'
    if (!f.colors.length) e.colors = 'Select at least one color'
    if (!f.sizes.length) e.sizes = 'Select at least one size'
    if (!imageList.length) e.images = 'Add at least one image URL'
    else if (imageList.some((u) => !/^https?:\/\//i.test(u))) e.images = 'Each image must be a valid http(s) URL'
    if (!f.description.trim()) e.description = 'Description is required'
    setErrors(e)
    return !Object.keys(e).length
  }

  const submit = async (ev) => {
    ev.preventDefault()
    setServerError('')
    if (!validate()) return
    setSaving(true)
    const body = { name: f.name.trim(), category: f.category, price: Number(f.price), stock: Number(f.stock), tag: f.tag.trim(), featured: !!f.featured, colors: f.colors, sizes: f.sizes, images: imageList, description: f.description.trim() }
    try {
      const d = editing ? await api.put(`/products/${product.id}`, body) : await api.post('/products', body)
      toast.success(editing ? 'Product updated' : 'Product created')
      onSaved(d.product, editing)
      onOpenChange(false)
    } catch (err) { setServerError(err.message) } finally { setSaving(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogTitle className="font-display text-3xl mb-1">{editing ? 'Edit product' : 'Add new sneaker'}</DialogTitle>
        <DialogDescription className="text-sm text-text-secondary mb-6">{editing ? `Editing ${product.name}` : 'Fill in the details to add a sneaker to the store.'}</DialogDescription>
        <form onSubmit={submit} noValidate className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <FormField id="name" label="Name" value={f.name} onChange={set('name')} error={errors.name} placeholder="Apex Runner" />
            <div>
              <Label htmlFor="category">Category</Label>
              <select id="category" value={f.category} onChange={set('category')} className="mt-2 w-full h-12 rounded-lg bg-transparent border border-border px-4 text-sm outline-none focus:border-gold">
                {productCategories.map((c) => <option key={c} value={c} className="bg-[var(--card-solid)]">{c}</option>)}
              </select>
            </div>
            <FormField id="price" label="Price (USD)" type="number" min="1" step="0.01" value={f.price} onChange={set('price')} error={errors.price} />
            <FormField id="stock" label="Stock" type="number" min="0" step="1" value={f.stock} onChange={set('stock')} error={errors.stock} />
            <FormField id="tag" label="Badge (optional)" value={f.tag} onChange={set('tag')} maxLength={20} placeholder="New, Limited…" />
            <label className="flex items-center gap-3 mt-8 cursor-pointer text-sm">
              <input type="checkbox" checked={!!f.featured} onChange={(e) => setF((s) => ({ ...s, featured: e.target.checked }))} className="accent-[rgb(var(--gold))] h-4 w-4" /> Featured on homepage
            </label>
          </div>

          <div>
            <Label>Colors</Label>
            <div className="flex gap-3 mt-2">
              {allColors.map((c) => (
                <button type="button" key={c} onClick={() => { setF((s) => ({ ...s, colors: toggle(s.colors, c) })); setErrors((e) => ({ ...e, colors: '' })) }} title={c} aria-pressed={f.colors.includes(c)} className={cn('h-8 w-8 rounded-full border-2 transition-all', f.colors.includes(c) ? 'border-gold scale-110' : 'border-border')} style={{ background: colorMap[c] }} />
              ))}
            </div>
            {errors.colors && <p className="text-xs text-red-500 mt-1.5">{errors.colors}</p>}
          </div>

          <div>
            <Label>Sizes</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {allSizes.map((s) => (
                <button type="button" key={s} onClick={() => { setF((x) => ({ ...x, sizes: toggle(x.sizes, s) })); setErrors((e) => ({ ...e, sizes: '' })) }} aria-pressed={f.sizes.includes(s)} className={cn('h-9 w-11 rounded-lg border text-sm transition-all', f.sizes.includes(s) ? 'border-gold bg-gold text-black font-semibold' : 'border-border hover:border-gold')}>{s}</button>
              ))}
            </div>
            {errors.sizes && <p className="text-xs text-red-500 mt-1.5">{errors.sizes}</p>}
          </div>

          <div>
            <Label htmlFor="images">Image URLs (one per line — the first is the main image)</Label>
            <Textarea id="images" value={f.images} onChange={set('images')} aria-invalid={!!errors.images} className={cn('mt-2 min-h-[90px] font-mono text-xs', errors.images && 'border-red-500/70')} placeholder="https://…" />
            {errors.images && <p className="text-xs text-red-500 mt-1.5">{errors.images}</p>}
            {imageList.length > 0 && !errors.images && <div className="flex gap-2 mt-2">{imageList.slice(0, 4).map((u, i) => <img key={i} src={u} alt="" className="h-12 w-12 rounded-lg object-cover" onError={(e) => (e.currentTarget.style.opacity = 0.2)} />)}</div>}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={f.description} onChange={set('description')} aria-invalid={!!errors.description} className={cn('mt-2', errors.description && 'border-red-500/70')} />
            {errors.description && <p className="text-xs text-red-500 mt-1.5">{errors.description}</p>}
          </div>

          {serverError && <p role="alert" className="text-sm text-red-500 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">{serverError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : editing ? 'Save changes' : 'Create product'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

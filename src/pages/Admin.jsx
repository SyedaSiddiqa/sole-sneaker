import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import gsap from 'gsap'
import { toast } from 'sonner'
import { LayoutDashboard, Package, ShoppingCart, Users, DollarSign, Plus, Pencil, Trash2, Loader2, AlertTriangle, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import StatusBadge from '@/components/StatusBadge'
import ProductFormDialog from '@/components/admin/ProductFormDialog'
import { PageSpinner } from '@/components/ProtectedRoute'
import { api } from '@/lib/api'
import { formatDate, formatPrice, onImgError, cn } from '@/lib/utils'

const TABS = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'products', label: 'Products', icon: Package },
  { key: 'orders', label: 'Orders', icon: ShoppingCart },
  { key: 'users', label: 'Users', icon: Users },
]
const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

function useLoad(path, key) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const reload = useCallback(() => api.get(path).then((d) => { setData(d[key] ?? d); setError('') }).catch((e) => setError(e.message)), [path, key])
  useEffect(() => { reload() }, [reload])
  return [data, setData, error, reload]
}

const Card = ({ children, className }) => <div className={cn('rounded-2xl glass p-6', className)}>{children}</div>
const Th = ({ children, className }) => <th className={cn('text-left text-[11px] font-semibold tracking-widest uppercase text-text-secondary px-4 py-3', className)}>{children}</th>
const Td = ({ children, className }) => <td className={cn('px-4 py-3 text-sm align-middle', className)}>{children}</td>
const Table = ({ children }) => <div className="overflow-x-auto"><table className="w-full min-w-[640px]">{children}</table></div>
const Empty = ({ text }) => <p className="text-center text-sm text-text-secondary py-12">{text}</p>

/* ---------------- Overview ---------------- */
function Overview() {
  const [stats, , error] = useLoad('/admin/stats', null)
  useEffect(() => {
    if (!stats) return
    const t = gsap.fromTo('.stat-card', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out' })
    return () => t.kill()
  }, [stats])
  if (error) return <p className="text-red-500">{error}</p>
  if (!stats) return <PageSpinner />
  const cards = [
    { label: 'Total Products', value: stats.totalProducts, icon: Package },
    { label: 'Total Users', value: stats.totalUsers, icon: Users },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart },
    { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: DollarSign },
  ]
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((c) => (
          <Card key={c.label} className="stat-card">
            <div className="flex items-center justify-between mb-4"><span className="text-[11px] tracking-widest uppercase text-text-secondary">{c.label}</span><c.icon size={18} className="text-gold" /></div>
            <p className="font-display text-4xl text-gradient-gold">{c.value}</p>
          </Card>
        ))}
      </div>
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <Card>
          <h3 className="font-display text-2xl mb-4">Recent Orders</h3>
          {stats.recentOrders.length === 0 ? <Empty text="No orders yet." /> : (
            <Table>
              <thead><tr><Th>Order</Th><Th>Customer</Th><Th>Total</Th><Th>Status</Th></tr></thead>
              <tbody>
                {stats.recentOrders.map((o) => (
                  <tr key={o.id} className="border-t border-border"><Td className="font-medium">#{o.id.slice(-8).toUpperCase()}</Td><Td>{o.user?.name || o.customer.name}</Td><Td className="text-gold">{formatPrice(o.totalPrice)}</Td><Td><StatusBadge status={o.status} /></Td></tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
        <div className="space-y-6">
          <Card>
            <h3 className="font-display text-2xl mb-4">Orders by status</h3>
            <ul className="space-y-3">{STATUSES.map((s) => <li key={s} className="flex items-center justify-between"><StatusBadge status={s} /><span className="font-semibold">{stats.ordersByStatus[s] || 0}</span></li>)}</ul>
          </Card>
          <Card className={stats.lowStock ? 'border-amber-500/40' : ''}>
            <div className="flex items-center gap-3"><AlertTriangle size={20} className={stats.lowStock ? 'text-amber-500' : 'text-text-secondary'} /><div><p className="font-display text-2xl">{stats.lowStock}</p><p className="text-xs text-text-secondary">products low on stock (≤ 5)</p></div></div>
          </Card>
        </div>
      </div>
    </div>
  )
}

/* ---------------- Products ---------------- */
function ProductsAdmin() {
  const [products, setProducts, error] = useLoad('/products?limit=48&sort=newest', 'products')
  const [q, setQ] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)

  const shown = useMemo(() => (products || []).filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.category.toLowerCase().includes(q.toLowerCase())), [products, q])

  const onSaved = (p, wasEdit) => setProducts((list) => (wasEdit ? list.map((x) => (x.id === p.id ? p : x)) : [p, ...list]))
  const confirmDelete = async () => {
    setBusy(true)
    try {
      await api.delete(`/products/${deleting.id}`)
      setProducts((l) => l.filter((x) => x.id !== deleting.id))
      toast.success('Product deleted')
      setDeleting(null)
    } catch (e) { toast.error(e.message) } finally { setBusy(false) }
  }

  if (error) return <p className="text-red-500">{error}</p>
  if (!products) return <PageSpinner />
  return (
    <Card>
      <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
        <div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="h-10 pl-9 pr-4 rounded-full bg-transparent border border-border text-sm outline-none focus:border-gold w-60" /></div>
        <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true) }}><Plus size={15} /> Add sneaker</Button>
      </div>
      {shown.length === 0 ? <Empty text="No products found." /> : (
        <Table>
          <thead><tr><Th>Product</Th><Th>Category</Th><Th>Price</Th><Th>Stock</Th><Th>Sold</Th><Th className="text-right">Actions</Th></tr></thead>
          <tbody>
            {shown.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <Td><div className="flex items-center gap-3"><img src={p.image} alt="" onError={onImgError} className="h-11 w-11 rounded-lg object-cover" /><div><p className="font-medium">{p.name}</p>{p.featured && <span className="text-[10px] text-gold tracking-widest uppercase">Featured</span>}</div></div></Td>
                <Td>{p.category}</Td><Td className="text-gold font-semibold">{formatPrice(p.price)}</Td>
                <Td><span className={cn(p.stock <= 5 && 'text-amber-500 font-semibold')}>{p.stock}</span></Td><Td>{p.popularity}</Td>
                <Td className="text-right whitespace-nowrap">
                  <button onClick={() => { setEditing(p); setFormOpen(true) }} aria-label={`Edit ${p.name}`} className="p-2 rounded-full hover:bg-gold/10 hover:text-gold transition-colors"><Pencil size={15} /></button>
                  <button onClick={() => setDeleting(p)} aria-label={`Delete ${p.name}`} className="p-2 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editing} onSaved={onSaved} />
      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent className="max-w-md">
          <DialogTitle className="font-display text-2xl mb-2">Delete {deleting?.name}?</DialogTitle>
          <DialogDescription className="text-sm text-text-secondary mb-6">This permanently removes the product from the store. Existing orders keep their records.</DialogDescription>
          <div className="flex justify-end gap-3"><Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button><Button onClick={confirmDelete} disabled={busy}>{busy ? <Loader2 size={15} className="animate-spin" /> : 'Delete'}</Button></div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

/* ---------------- Orders ---------------- */
function OrdersAdmin() {
  const [orders, setOrders, error] = useLoad('/orders', 'orders')
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(null)
  const [updating, setUpdating] = useState(null)

  const updateStatus = async (order, status) => {
    setUpdating(order.id)
    try {
      const d = await api.patch(`/orders/${order.id}/status`, { status })
      setOrders((l) => l.map((o) => (o.id === order.id ? { ...o, ...d.order, user: o.user } : o)))
      toast.success(`Order #${order.id.slice(-8).toUpperCase()} → ${status}`)
    } catch (e) { toast.error(e.message) } finally { setUpdating(null) }
  }

  if (error) return <p className="text-red-500">{error}</p>
  if (!orders) return <PageSpinner />
  const shown = filter === 'All' ? orders : orders.filter((o) => o.status === filter)
  return (
    <Card>
      <div className="flex gap-2 flex-wrap mb-5">
        {['All', ...STATUSES].map((s) => <button key={s} onClick={() => setFilter(s)} className={cn('px-4 py-1.5 rounded-full text-xs border transition-all', filter === s ? 'bg-gold text-black border-gold font-semibold' : 'border-border hover:border-gold')}>{s}</button>)}
      </div>
      {shown.length === 0 ? <Empty text="No orders in this view." /> : (
        <Table>
          <thead><tr><Th>Order</Th><Th>Customer</Th><Th>Date</Th><Th>Total</Th><Th>Status</Th><Th className="text-right">Details</Th></tr></thead>
          <tbody>
            {shown.map((o) => (
              <tr key={o.id} className="border-t border-border">
                <Td className="font-medium">#{o.id.slice(-8).toUpperCase()}</Td>
                <Td><p>{o.customer.name}</p><p className="text-xs text-text-secondary">{o.user?.email}</p></Td>
                <Td>{formatDate(o.createdAt)}</Td><Td className="text-gold font-semibold">{formatPrice(o.totalPrice)}</Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <select aria-label="Order status" value={o.status} disabled={updating === o.id || o.status === 'Cancelled' || o.status === 'Delivered'} onChange={(e) => updateStatus(o, e.target.value)} className="h-9 rounded-lg bg-transparent border border-border px-2 text-xs outline-none focus:border-gold disabled:opacity-60">
                      {STATUSES.map((s) => <option key={s} value={s} className="bg-[var(--card-solid)]">{s}</option>)}
                    </select>
                    {updating === o.id && <Loader2 size={14} className="animate-spin text-gold" />}
                  </div>
                </Td>
                <Td className="text-right"><Button size="sm" variant="outline" onClick={() => setSelected(o)}>View</Button></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-xl">
          {selected && (
            <>
              <DialogTitle className="font-display text-3xl mb-1">Order #{selected.id.slice(-8).toUpperCase()}</DialogTitle>
              <DialogDescription className="text-sm text-text-secondary mb-5">{formatDate(selected.createdAt)} · <StatusBadge status={selected.status} className="ml-1" /></DialogDescription>
              <div className="space-y-3 mb-5">
                {selected.items.map((i, k) => <div key={k} className="flex items-center gap-3"><img src={i.image} alt="" onError={onImgError} className="h-12 w-12 rounded-lg object-cover" /><div className="flex-1 text-sm"><p className="font-medium">{i.name}</p><p className="text-xs text-text-secondary">{i.color} · Size {i.size} × {i.qty}</p></div><span className="text-sm text-gold">{formatPrice(i.price * i.qty)}</span></div>)}
              </div>
              <div className="grid sm:grid-cols-2 gap-4 text-sm text-text-secondary border-t border-border pt-4">
                <div><p className="text-xs tracking-widest uppercase text-gold mb-1">Customer</p>{selected.customer.name}<br />{selected.customer.email}<br />{selected.customer.phone}</div>
                <div><p className="text-xs tracking-widest uppercase text-gold mb-1">Ship to</p>{selected.shippingAddress.street}<br />{selected.shippingAddress.city}, {selected.shippingAddress.state} {selected.shippingAddress.zip}</div>
              </div>
              {selected.notes && <p className="text-xs text-text-secondary mt-4">Note: {selected.notes}</p>}
              <p className="font-display text-2xl text-right mt-4">Total <span className="text-gold">{formatPrice(selected.totalPrice)}</span></p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}

/* ---------------- Users ---------------- */
function UsersAdmin() {
  const [users, setUsers, error] = useLoad('/admin/users', 'users')
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)
  const confirmDelete = async () => {
    setBusy(true)
    try {
      await api.delete(`/admin/users/${deleting.id}`)
      setUsers((l) => l.filter((u) => u.id !== deleting.id))
      toast.success('User deleted'); setDeleting(null)
    } catch (e) { toast.error(e.message) } finally { setBusy(false) }
  }
  if (error) return <p className="text-red-500">{error}</p>
  if (!users) return <PageSpinner />
  return (
    <Card>
      {users.length === 0 ? <Empty text="No users." /> : (
        <Table>
          <thead><tr><Th>User</Th><Th>Role</Th><Th>Orders</Th><Th>Joined</Th><Th className="text-right">Actions</Th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-border">
                <Td><div className="flex items-center gap-3"><span className="h-9 w-9 rounded-full bg-gold text-black text-xs font-bold flex items-center justify-center uppercase">{u.name[0]}</span><div><p className="font-medium">{u.name}</p><p className="text-xs text-text-secondary">{u.email}</p></div></div></Td>
                <Td><span className={cn('rounded-full px-3 py-1 text-[11px] font-semibold tracking-wider uppercase border', u.role === 'admin' ? 'border-gold text-gold bg-gold/10' : 'border-border text-text-secondary')}>{u.role}</span></Td>
                <Td>{u.orders}</Td><Td>{formatDate(u.createdAt)}</Td>
                <Td className="text-right">{u.role !== 'admin' && <button onClick={() => setDeleting(u)} aria-label={`Delete ${u.name}`} className="p-2 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent className="max-w-md">
          <DialogTitle className="font-display text-2xl mb-2">Delete {deleting?.name}?</DialogTitle>
          <DialogDescription className="text-sm text-text-secondary mb-6">Their account and cart are removed. Order history is kept.</DialogDescription>
          <div className="flex justify-end gap-3"><Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button><Button onClick={confirmDelete} disabled={busy}>{busy ? <Loader2 size={15} className="animate-spin" /> : 'Delete'}</Button></div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

/* ---------------- Shell ---------------- */
export default function Admin() {
  const [params, setParams] = useSearchParams()
  const tab = TABS.some((t) => t.key === params.get('tab')) ? params.get('tab') : 'overview'
  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 md:px-10 min-h-screen">
      <div className="mb-8">
        <span className="text-xs tracking-[0.35em] text-gold uppercase">Admin</span>
        <h1 className="font-display text-5xl mt-2">DASHBOARD</h1>
      </div>
      <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-1">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setParams({ tab: t.key })} className={cn('flex items-center gap-2 px-5 py-2.5 rounded-full text-sm whitespace-nowrap border transition-all', tab === t.key ? 'bg-gold text-black border-gold font-semibold' : 'border-border hover:border-gold')}>
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>
      {tab === 'overview' && <Overview />}
      {tab === 'products' && <ProductsAdmin />}
      {tab === 'orders' && <OrdersAdmin />}
      {tab === 'users' && <UsersAdmin />}
    </div>
  )
}

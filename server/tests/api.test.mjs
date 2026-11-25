// End-to-end API smoke test. Usage: node tests/api.test.mjs  (server must be running on :5000, DB seeded)
const BASE = process.env.API || 'http://localhost:5000/api'
let pass = 0, fail = 0
const ok = (cond, name, extra = '') => { cond ? pass++ : fail++; console.log(`${cond ? '  PASS' : '  FAIL'}  ${name}${cond ? '' : '  ' + extra}`) }
const call = async (method, path, body, token) => {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  let data = {}
  try { data = await res.json() } catch {}
  return { status: res.status, data }
}

const email = `test${Date.now()}@example.com`
console.log('\n# Auth')
let r = await call('POST', '/auth/register', { name: 'T', email, password: 'x' })
ok(r.status === 400, 'register rejects short name / weak password', JSON.stringify(r.data))
r = await call('POST', '/auth/register', { name: 'Test User', email, password: 'Passw0rdTest' })
ok(r.status === 201 && r.data.token && r.data.user.role === 'customer', 'register creates customer + JWT')
ok(!('password' in r.data.user), 'password never returned')
const token = r.data.token
r = await call('POST', '/auth/register', { name: 'Test User', email, password: 'Passw0rdTest' })
ok(r.status === 409, 'duplicate email rejected', r.status)
r = await call('POST', '/auth/register', { name: 'Hacker', email: `h${Date.now()}@example.com`, password: 'Passw0rdTest', role: 'admin' })
ok(r.status === 201 && r.data.user.role === 'customer', 'cannot self-register as admin')
r = await call('POST', '/auth/login', { email, password: 'wrongpass1' })
ok(r.status === 401, 'wrong password rejected')
r = await call('POST', '/auth/login', { email, password: 'Passw0rdTest' })
ok(r.status === 200 && r.data.token, 'login works')
r = await call('GET', '/auth/me', null, token)
ok(r.status === 200 && r.data.user.email === email, 'GET /me with token')
r = await call('GET', '/auth/me')
ok(r.status === 401, 'GET /me without token -> 401')
r = await call('GET', '/auth/me', null, 'garbage.token.value')
ok(r.status === 401, 'invalid token -> 401')

console.log('\n# Products')
r = await call('GET', '/products?limit=48')
ok(r.status === 200 && r.data.total === 24 && r.data.products.length === 24, 'lists all 24 products', JSON.stringify(r.data).slice(0, 120))
const first = r.data.products[0]
ok(first.id && first.image && first.images.length, 'product JSON has id + image')
r = await call('GET', '/products?category=Signature')
ok(r.data.products.length > 0 && r.data.products.every((p) => p.category === 'Signature'), 'category filter')
r = await call('GET', '/products?minPrice=150&maxPrice=200&limit=48')
ok(r.data.products.length > 0 && r.data.products.every((p) => p.price >= 150 && p.price <= 200), 'price filter')
r = await call('GET', '/products?sizes=38&limit=48')
ok(r.data.products.length > 0 && r.data.products.every((p) => p.sizes.includes(38)), 'size filter')
r = await call('GET', '/products?colors=Red&limit=48')
ok(r.data.products.length > 0 && r.data.products.every((p) => p.colors.includes('Red')), 'color filter')
r = await call('GET', '/products?search=apex')
ok(r.data.products.length === 1 && r.data.products[0].name === 'Apex Runner', 'search')
r = await call('GET', '/products?sort=price-asc&limit=48')
ok(r.data.products.every((p, i, a) => i === 0 || a[i - 1].price <= p.price), 'sort price asc')
r = await call('GET', '/products?sort=price-desc&limit=48')
ok(r.data.products.every((p, i, a) => i === 0 || a[i - 1].price >= p.price), 'sort price desc')
r = await call('GET', '/products?sort=popular&limit=48')
ok(r.data.products.every((p, i, a) => i === 0 || a[i - 1].popularity >= p.popularity), 'sort popularity')
r = await call('GET', '/products?limit=6&page=2')
ok(r.data.products.length === 6 && r.data.pages === 4 && r.data.page === 2, 'pagination')
r = await call('GET', `/products/${first.id}`)
ok(r.status === 200 && r.data.product.name === first.name, 'product detail')
r = await call('GET', '/products/notanid')
ok(r.status === 400, 'invalid id -> 400')
r = await call('GET', '/products/64b64b64b64b64b64b64b64b')
ok(r.status === 404, 'unknown id -> 404')
r = await call('GET', `/products/${first.id}/related`)
ok(r.status === 200 && r.data.products.length > 0, 'related products')

console.log('\n# Cart (server-side)')
const prod = first
const color = prod.colors[0], size = prod.sizes[0]
r = await call('GET', '/cart')
ok(r.status === 401, 'cart requires auth')
r = await call('POST', '/cart/items', { productId: prod.id, color, size: 99, qty: 1 }, token)
ok(r.status === 400, 'invalid size rejected', JSON.stringify(r.data))
r = await call('POST', '/cart/items', { productId: prod.id, color, size, qty: 2 }, token)
ok(r.status === 201 && r.data.items.length === 1 && r.data.items[0].qty === 2, 'add to cart')
r = await call('POST', '/cart/items', { productId: prod.id, color, size, qty: 1 }, token)
ok(r.data.items.length === 1 && r.data.items[0].qty === 3, 'same variant merges quantity')
const lineId = r.data.items[0].lineId
r = await call('PATCH', `/cart/items/${lineId}`, { qty: 1 }, token)
ok(r.data.items[0].qty === 1, 'update quantity')
const second = (await call('GET', '/products?limit=48')).data.products[5]
r = await call('POST', '/cart/items', { productId: second.id, color: second.colors[0], size: second.sizes[0], qty: 1 }, token)
ok(r.data.items.length === 2, 'second item added')
r = await call('DELETE', `/cart/items/${r.data.items[1].lineId}`, null, token)
ok(r.data.items.length === 1, 'remove item')
r = await call('POST', '/cart/merge', { items: [{ id: second.id, color: second.colors[0], size: second.sizes[0], qty: 2 }] }, token)
ok(r.data.items.length === 2, 'guest cart merge')
r = await call('GET', '/cart', null, token)
ok(r.data.items.length === 2 && r.data.items.every((i) => i.price > 0 && i.image), 'cart persists with live prices')

console.log('\n# Wishlist')
r = await call('POST', `/wishlist/${prod.id}`, null, token)
ok(r.status === 201 && r.data.products.length === 1, 'add to wishlist')
r = await call('POST', `/wishlist/${prod.id}`, null, token)
ok(r.data.products.length === 1, 'wishlist has no duplicates')
r = await call('GET', '/wishlist', null, token)
ok(r.data.products[0].id === prod.id, 'get wishlist')
r = await call('DELETE', `/wishlist/${prod.id}`, null, token)
ok(r.data.products.length === 0, 'remove from wishlist')

console.log('\n# Orders')
const customer = { name: 'Test User', email, phone: '+1 234 567 890' }
const shippingAddress = { street: '123 Fashion Ave', city: 'New York', state: 'NY', zip: '10001', country: 'United States' }
r = await call('POST', '/orders', { customer: { ...customer, phone: 'abc' }, shippingAddress, paymentMethod: 'COD' }, token)
ok(r.status === 400, 'order validation: bad phone')
r = await call('POST', '/orders', { customer, shippingAddress, paymentMethod: 'CARD' }, token)
ok(r.status === 400, 'order validation: only COD allowed')
const stockBefore = (await call('GET', `/products/${prod.id}`)).data.product.stock
r = await call('POST', '/orders', { customer, shippingAddress, paymentMethod: 'COD', notes: 'Leave at door', totalPrice: 1 }, token)
ok(r.status === 201 && r.data.order.status === 'Pending', 'place COD order')
const order = r.data.order
const expectedItems = prod.price * 1 + second.price * 2
ok(order.itemsPrice === expectedItems && order.totalPrice === order.itemsPrice + order.shippingPrice, 'server computes totals (ignores client totalPrice)', JSON.stringify(order))
ok(order.shippingPrice === 0, 'free shipping over $200')
const stockAfter = (await call('GET', `/products/${prod.id}`)).data.product.stock
ok(stockAfter === stockBefore - 1, 'stock decremented', `${stockBefore} -> ${stockAfter}`)
r = await call('GET', '/cart', null, token)
ok(r.data.items.length === 0, 'cart cleared after order')
r = await call('POST', '/orders', { customer, shippingAddress, paymentMethod: 'COD' }, token)
ok(r.status === 400, 'cannot order with empty cart')
r = await call('GET', '/orders/mine', null, token)
ok(r.data.orders.length === 1, 'order history')
r = await call('GET', `/orders/${order.id}`, null, token)
ok(r.status === 200 && r.data.order.items.length === 2, 'order detail')

// another user cannot read it
const other = await call('POST', '/auth/register', { name: 'Other User', email: `o${Date.now()}@example.com`, password: 'Passw0rdTest' })
r = await call('GET', `/orders/${order.id}`, null, other.data.token)
ok(r.status === 403, "other users can't view someone's order")
r = await call('PATCH', `/orders/${order.id}/cancel`, null, other.data.token)
ok(r.status === 403, "other users can't cancel someone's order")

console.log('\n# Role-based access')
r = await call('GET', '/admin/stats', null, token)
ok(r.status === 403, 'customer blocked from admin stats')
r = await call('GET', '/orders', null, token)
ok(r.status === 403, 'customer blocked from all-orders')
r = await call('POST', '/products', { name: 'x' }, token)
ok(r.status === 403, 'customer blocked from creating products')
r = await call('PATCH', `/orders/${order.id}/status`, { status: 'Delivered' }, token)
ok(r.status === 403, 'customer cannot change order status')

console.log('\n# Admin')
r = await call('POST', '/auth/login', { email: 'admin@sole.com', password: 'Admin@12345' })
ok(r.status === 200 && r.data.user.role === 'admin', 'admin login')
const admin = r.data.token
r = await call('GET', '/admin/stats', null, admin)
ok(r.status === 200 && r.data.totalProducts === 24 && r.data.totalUsers >= 3 && r.data.totalOrders >= 1 && r.data.totalRevenue >= order.totalPrice, 'stats', JSON.stringify(r.data).slice(0, 200))
r = await call('GET', '/admin/users', null, admin)
ok(r.data.users.length >= 3 && !r.data.users.some((u) => 'password' in u), 'list users (no passwords)')
r = await call('POST', '/products', { name: 'x' }, admin)
ok(r.status === 400, 'product validation')
const newP = { name: 'Test Sneaker', description: 'A test product', category: 'Running', price: 123, colors: ['Black'], sizes: [41, 42], images: ['https://example.com/a.jpg'], stock: 7, tag: 'New', featured: false }
r = await call('POST', '/products', newP, admin)
ok(r.status === 201 && r.data.product.id, 'admin creates product')
const pid = r.data.product.id
r = await call('PUT', `/products/${pid}`, { price: 150, stock: 3 }, admin)
ok(r.status === 200 && r.data.product.price === 150 && r.data.product.stock === 3, 'admin edits product')
r = await call('GET', '/orders', null, admin)
ok(r.data.orders.length >= 1 && r.data.orders[0].user.email, 'admin lists all orders w/ user')
r = await call('PATCH', `/orders/${order.id}/status`, { status: 'Bogus' }, admin)
ok(r.status === 400, 'invalid status rejected')
r = await call('PATCH', `/orders/${order.id}/status`, { status: 'Shipped' }, admin)
ok(r.status === 200 && r.data.order.status === 'Shipped' && r.data.order.statusHistory.length === 2, 'admin updates order status + history')
r = await call('PATCH', `/orders/${order.id}/cancel`, null, token)
ok(r.status === 400, 'shipped order cannot be cancelled by customer')
r = await call('PATCH', `/orders/${order.id}/status`, { status: 'Delivered' }, admin)
ok(r.data.order.isPaid === true && r.data.order.deliveredAt, 'delivered marks COD paid')
r = await call('DELETE', `/products/${pid}`, null, admin)
ok(r.status === 200, 'admin deletes product')
r = await call('GET', `/products/${pid}`)
ok(r.status === 404, 'deleted product is gone')

// cancel + restock flow
const p3 = (await call('GET', '/products?limit=48')).data.products[8]
await call('POST', '/cart/items', { productId: p3.id, color: p3.colors[0], size: p3.sizes[0], qty: 2 }, token)
const s0 = (await call('GET', `/products/${p3.id}`)).data.product.stock
const o2 = (await call('POST', '/orders', { customer, shippingAddress, paymentMethod: 'COD' }, token)).data.order
r = await call('PATCH', `/orders/${o2.id}/cancel`, null, token)
const s1 = (await call('GET', `/products/${p3.id}`)).data.product.stock
ok(r.data.order.status === 'Cancelled' && s1 === s0, 'customer cancels pending order -> stock restored', `${s0} -> ${s1}`)
r = await call('DELETE', `/admin/users/${other.data.user.id}`, null, admin)
ok(r.status === 200, 'admin deletes user')
r = await call('GET', '/admin/users', null, admin)
const adminId = r.data.users.find((u) => u.email === 'admin@sole.com').id
r = await call('DELETE', `/admin/users/${adminId}`, null, admin)
ok(r.status === 400, 'admin cannot delete self')

// oversell
const p4 = (await call('GET', '/products?limit=48')).data.products[10]
await call('PUT', `/products/${p4.id}`, { stock: 1 }, admin)
r = await call('POST', '/cart/items', { productId: p4.id, color: p4.colors[0], size: p4.sizes[0], qty: 2 }, token)
ok(r.status === 400, 'cannot add more than stock to cart', JSON.stringify(r.data))

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)

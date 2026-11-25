/**
 * End-to-end UI tests: the real <App /> rendered in jsdom, talking to the real Express API + MongoDB.
 * Prerequisites:  API running on :5000 and `npm run seed` executed (fresh data).  Run:  npm test
 */
import React from 'react'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen, waitFor, within, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

vi.mock('@/components/Hero3D', async () => {
  const React = await import('react')
  return { default: () => React.createElement('div', { 'data-testid': 'hero3d' }) }
})
vi.mock('@/components/LoadingScreen', async () => {
  const React = await import('react')
  return { default: ({ onComplete }) => { React.useEffect(() => { onComplete() }, []); return null } }
})

import App from '@/App'
import { ThemeProvider } from '@/context/ThemeContext'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { WishlistProvider } from '@/context/WishlistContext'

const API = 'http://localhost:5000/api'
const T = { timeout: 15000 }
const json = (path, { token, ...opts } = {}) =>
  fetch(API + path, { ...opts, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } }).then((r) => r.json())
const post = (path, body, token) => json(path, { method: 'POST', body: JSON.stringify(body), token })

function renderApp(route = '/', token) {
  cleanup()
  if (token) localStorage.setItem('sole-token', token)
  return render(
    <MemoryRouter initialEntries={[route]}>
      <ThemeProvider><AuthProvider><CartProvider><WishlistProvider><App /></WishlistProvider></CartProvider></AuthProvider></ThemeProvider>
    </MemoryRouter>
  )
}

const countText = () => document.querySelector('[data-testid="product-count"]')?.textContent.replace(/\s+/g, ' ').trim()
const cards = () => [...document.querySelectorAll('.product-card')]
const prices = () => cards().map((c) => parseFloat(c.querySelector('.text-gold.text-2xl, .font-display.text-2xl')?.textContent.replace('$', '')))

let user // fresh customer used by shopping tests
let admin, customerToken, apex

beforeAll(async () => {
  const email = `ui${Date.now()}@example.com`
  user = { email, password: 'Passw0rd1', name: 'Uma Tester', ...(await post('/auth/register', { name: 'Uma Tester', email, password: 'Passw0rd1' })) }
  admin = (await post('/auth/login', { email: 'admin@sole.com', password: 'Admin@12345' })).token
  customerToken = (await post('/auth/login', { email: 'customer@sole.com', password: 'Customer@123' })).token
  apex = (await json('/products?search=apex')).products[0]
})

describe('Storefront', () => {
  it('home page renders hero and featured products from MongoDB', async () => {
    renderApp('/')
    expect(await screen.findByText('DIFFERENT.')).toBeInTheDocument()
    expect(screen.getByTestId('hero3d')).toBeInTheDocument()
    expect(await screen.findByText('Urban Drift', {}, T)).toBeInTheDocument()
    expect(screen.getByText('BROWSE THE RANGE')).toBeInTheDocument()
    expect(screen.getByText('THE SOLE GALLERY')).toBeInTheDocument()
  })

  it('products page: paginates, filters by category, sorts, clears', async () => {
    const ui = userEvent.setup()
    renderApp('/products')
    await waitFor(() => expect(countText()).toBe('24 Products'), T)
    await waitFor(() => expect(cards()).toHaveLength(9), T)
    const firstPageNames = cards().map((c) => c.querySelector('h3').textContent)

    // pagination
    await ui.click(screen.getByRole('button', { name: '2' }))
    await waitFor(() => {
      expect(cards()).toHaveLength(9)
      expect(cards().map((c) => c.querySelector('h3').textContent)).not.toEqual(firstPageNames)
    }, T)
    await ui.click(await screen.findByRole('button', { name: '3' }))
    await waitFor(() => expect(cards()).toHaveLength(6), T)

    // category filter (resets to page 1)
    await ui.click(screen.getAllByRole('button', { name: 'Signature' })[0])
    await waitFor(() => expect(countText()).toBe('6 Products'), T)
    await waitFor(() => expect(cards()).toHaveLength(6), T)
    cards().forEach((c) => expect(c).toHaveTextContent('Signature'))

    // sort price low -> high
    await ui.click(screen.getByRole('button', { name: /Sort:/ }))
    await ui.click(await screen.findByRole('menuitem', { name: 'Price: Low to High' }))
    await waitFor(() => {
      const p = prices()
      expect(p).toHaveLength(6)
      expect(p).toEqual([...p].sort((a, b) => a - b))
      expect(p[0]).toBeLessThan(p[5])
    }, T)

    // colour filter narrows further, then clear all
    await ui.click(within(document.querySelector('aside')).getByTitle('Gold'))
    await waitFor(() => expect(Number(countText().split(' ')[0])).toBeLessThan(6), T)
    await ui.click(screen.getByRole('button', { name: /Clear all filters/i }))
    await waitFor(() => expect(countText()).toBe('24 Products'), T)
  })

  it('search query narrows results', async () => {
    renderApp('/products?search=apex')
    await waitFor(() => expect(countText()).toBe('1 Product'), T)
    expect(await screen.findByText('Apex Runner')).toBeInTheDocument()
  })

  it('shows an empty state when nothing matches', async () => {
    renderApp('/products?search=zzzzzz')
    expect(await screen.findByText('No sneakers match your filters', {}, T)).toBeInTheDocument()
  })

  it('product details page shows live data and unknown ids show not-found', async () => {
    renderApp(`/products/${apex.id}`)
    expect(await screen.findByRole('heading', { name: 'Apex Runner' }, T)).toBeInTheDocument()
    expect(screen.getByText('$189.00')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ADD TO CART' })).toBeEnabled()
    renderApp('/products/64b64b64b64b64b64b64b64b')
    expect(await screen.findByText('Product not found', {}, T)).toBeInTheDocument()
  })
})

describe('Authentication & protected routes', () => {
  it('redirects guests from /checkout to login, validates, rejects bad credentials, then signs in and returns', async () => {
    const ui = userEvent.setup()
    renderApp('/checkout')
    expect(await screen.findByText('WELCOME BACK', {}, T)).toBeInTheDocument()

    await ui.click(screen.getByRole('button', { name: 'SIGN IN' }))
    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument()

    await ui.type(screen.getByLabelText('Email'), 'customer@sole.com')
    await ui.type(screen.getByLabelText('Password'), 'wrong-password1')
    await ui.click(screen.getByRole('button', { name: 'SIGN IN' }))
    expect(await screen.findByRole('alert', {}, T)).toHaveTextContent('Invalid email or password')

    await ui.clear(screen.getByLabelText('Password'))
    await ui.type(screen.getByLabelText('Password'), 'Customer@123')
    await ui.click(screen.getByRole('button', { name: 'SIGN IN' }))
    // redirected back to the originally requested protected page
    expect(await screen.findByText('Your bag is empty', {}, T)).toBeInTheDocument()
    expect(localStorage.getItem('sole-token')).toBeTruthy()
  })

  it('registers a new account with client-side validation, then lands signed in', async () => {
    const ui = userEvent.setup()
    renderApp('/register')
    await ui.type(await screen.findByLabelText('Full name'), 'Tessa Tester')
    await ui.type(screen.getByLabelText('Email'), `tessa${Date.now()}@example.com`)
    await ui.type(screen.getByLabelText('Password'), 'weak')
    await ui.type(screen.getByLabelText('Confirm password'), 'nope')
    await ui.click(screen.getByRole('button', { name: 'CREATE ACCOUNT' }))
    expect(await screen.findByText('At least 8 characters')).toBeInTheDocument()
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument()

    await ui.clear(screen.getByLabelText('Password'))
    await ui.clear(screen.getByLabelText('Confirm password'))
    await ui.type(screen.getByLabelText('Password'), 'Passw0rd9')
    await ui.type(screen.getByLabelText('Confirm password'), 'Passw0rd9')
    await ui.click(screen.getByRole('button', { name: 'CREATE ACCOUNT' }))
    expect(await screen.findByText('Tessa', {}, T)).toBeInTheDocument() // navbar account menu
    expect(screen.getByText('DIFFERENT.')).toBeInTheDocument()
  })

  it('blocks a customer from /admin (role-based) and an expired token signs the user out', async () => {
    renderApp('/admin', customerToken)
    expect(await screen.findByText('ACCESS DENIED', {}, T)).toBeInTheDocument()
    renderApp('/orders', 'not.a.valid.token')
    expect(await screen.findByText('WELCOME BACK', {}, T)).toBeInTheDocument()
  })
})

describe('Cart → Wishlist → Checkout → Orders (signed-in customer)', () => {
  it('requires a size, then adds to the server-side cart and opens the drawer', async () => {
    const ui = userEvent.setup()
    renderApp(`/products/${apex.id}`, user.token)
    await screen.findByRole('heading', { name: 'Apex Runner' }, T)

    await ui.click(screen.getByRole('button', { name: 'ADD TO CART' }))
    expect(await screen.findByText('Please select a size')).toBeInTheDocument()

    await ui.click(screen.getByRole('button', { name: '40' }))
    await ui.click(screen.getByRole('button', { name: 'ADD TO CART' }))
    const drawer = await screen.findByRole('dialog', {}, T)
    expect(await within(drawer).findByText('Your Bag')).toBeInTheDocument()
    expect(await within(drawer).findByText('Apex Runner', {}, T)).toBeInTheDocument()
    expect(within(drawer).getByText('$189.00', { selector: 'span.font-semibold' })).toBeInTheDocument()

    // really persisted in MongoDB
    const cart = await json('/cart', { token: user.token })
    expect(cart.items).toHaveLength(1)
    expect(cart.items[0]).toMatchObject({ name: 'Apex Runner', size: 40, qty: 1 })

    // quantity + remove through the UI
    await ui.click(within(drawer).getByRole('button', { name: 'Increase' }))
    await waitFor(async () => expect((await json('/cart', { token: user.token })).items[0].qty).toBe(2), T)
    await ui.click(within(drawer).getByRole('button', { name: 'Decrease' }))
    await waitFor(async () => expect((await json('/cart', { token: user.token })).items[0].qty).toBe(1), T)
  })

  it('wishlists a product and lists it on /wishlist', async () => {
    const ui = userEvent.setup()
    renderApp(`/products/${apex.id}`, user.token)
    await screen.findByRole('heading', { name: 'Apex Runner' }, T)
    await ui.click(screen.getAllByRole('button', { name: 'Add to wishlist' })[0]) // first = the main product's heart
    await waitFor(async () => expect((await json('/wishlist', { token: user.token })).products).toHaveLength(1), T)
    renderApp('/wishlist', user.token)
    expect(await screen.findByText('Apex Runner', {}, T)).toBeInTheDocument()
    expect(screen.getByText('YOUR WISHLIST')).toBeInTheDocument()
  })

  it('validates the checkout form, places a COD order, then shows it in history and cancels it', async () => {
    const ui = userEvent.setup()
    renderApp('/checkout', user.token)
    expect(await screen.findByRole('heading', { name: 'CHECKOUT' }, T)).toBeInTheDocument()
    expect(screen.getByText('Cash on Delivery')).toBeInTheDocument()
    expect(await screen.findByDisplayValue('Uma Tester')).toBeInTheDocument() // prefilled from account

    await ui.click(screen.getByRole('button', { name: /PLACE ORDER/ }))
    expect(await screen.findByText('Enter a valid phone number')).toBeInTheDocument()
    expect(screen.getByText('Street address is required')).toBeInTheDocument()

    await ui.type(screen.getByLabelText('Phone'), '+1 234 567 890')
    await ui.type(screen.getByLabelText('Street Address'), '123 Fashion Avenue')
    await ui.type(screen.getByLabelText('City'), 'New York')
    await ui.type(screen.getByLabelText('State'), 'NY')
    await ui.type(screen.getByLabelText('ZIP Code'), '10001')
    await ui.click(screen.getByRole('button', { name: /PLACE ORDER/ }))
    expect(await screen.findByText('ORDER CONFIRMED', {}, T)).toBeInTheDocument()

    const mine = await json('/orders/mine', { token: user.token })
    expect(mine.orders).toHaveLength(1)
    expect(mine.orders[0]).toMatchObject({ status: 'Pending', paymentMethod: 'COD', totalPrice: 204 })
    expect((await json('/cart', { token: user.token })).items).toHaveLength(0)

    // order history
    renderApp('/orders', user.token)
    expect(await screen.findByText('Pending', {}, T)).toBeInTheDocument()
    await ui.click(screen.getByText(/items$/, { exact: false }).closest('a'))
    expect(await screen.findByText('Order placed', {}, T)).toBeInTheDocument()
    expect(screen.getByText('Apex Runner')).toBeInTheDocument()

    // cancel
    await ui.click(screen.getByRole('button', { name: 'Cancel order' }))
    await ui.click(await screen.findByRole('button', { name: 'Yes, cancel' }))
    expect(await screen.findByText('This order was cancelled.', {}, T)).toBeInTheDocument()
  })
})

describe('Admin dashboard', () => {
  it('shows live stats, manages products (validate → create → delete), updates order status, lists users', async () => {
    const ui = userEvent.setup()
    // a pending order for the status test
    const buyer = await post('/auth/register', { name: 'Order Buyer', email: `buyer${Date.now()}@example.com`, password: 'Passw0rd1' })
    const prod = (await json('/products?limit=1&sort=newest')).products[0]
    await post('/cart/items', { productId: prod.id, color: prod.colors[0], size: prod.sizes[0], qty: 1 }, buyer.token)
    const order = (await post('/orders', { customer: { name: 'Order Buyer', email: buyer.user.email, phone: '+1 555 000 1111' }, shippingAddress: { street: '1 Test St', city: 'NYC', state: 'NY', zip: '10001' }, paymentMethod: 'COD' }, buyer.token)).order
    expect(order.status).toBe('Pending')

    renderApp('/admin', admin)
    expect(await screen.findByText('DASHBOARD', {}, T)).toBeInTheDocument()
    for (const label of ['Total Products', 'Total Users', 'Total Orders', 'Total Revenue']) expect(await screen.findByText(label, {}, T)).toBeInTheDocument()
    expect(await screen.findByText('Recent Orders', {}, T)).toBeInTheDocument()

    // products
    await ui.click(screen.getByRole('button', { name: /Products/ }))
    expect(await screen.findByText('Apex Runner', {}, T)).toBeInTheDocument()
    await ui.click(screen.getByRole('button', { name: /Add sneaker/ }))
    const dialog = await screen.findByRole('dialog')
    await ui.click(within(dialog).getByRole('button', { name: 'Create product' }))
    expect(await within(dialog).findByText('Name is required')).toBeInTheDocument()
    expect(within(dialog).getByText('Select at least one color')).toBeInTheDocument()

    await ui.type(within(dialog).getByLabelText('Name'), 'UI Test Sneaker')
    await ui.type(within(dialog).getByLabelText('Price (USD)'), '222')
    await ui.click(within(dialog).getByTitle('Black'))
    await ui.click(within(dialog).getByRole('button', { name: '41' }))
    await ui.type(within(dialog).getByLabelText(/Image URLs/), 'https://example.com/shoe.jpg')
    await ui.type(within(dialog).getByLabelText('Description'), 'Created from the admin UI test.')
    await ui.click(within(dialog).getByRole('button', { name: 'Create product' }))
    expect(await screen.findByText('UI Test Sneaker', {}, T)).toBeInTheDocument()
    expect((await json('/products?search=UI%20Test')).products).toHaveLength(1)

    await ui.click(screen.getByRole('button', { name: 'Delete UI Test Sneaker' }))
    const confirm = await screen.findByRole('dialog')
    await ui.click(within(confirm).getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(screen.queryByText('UI Test Sneaker')).not.toBeInTheDocument(), T)
    expect((await json('/products?search=UI%20Test')).products).toHaveLength(0)

    // orders
    await ui.click(screen.getByRole('button', { name: /Orders/ }))
    await screen.findAllByLabelText('Order status', {}, T)
    const select = screen.getAllByLabelText('Order status').find((s) => s.value === 'Pending')
    await ui.selectOptions(select, 'Shipped')
    await waitFor(async () => expect((await json(`/orders/${order.id}`, { token: admin })).order.status).toBe('Shipped'), T)

    // users
    await ui.click(screen.getByRole('button', { name: /Users/ }))
    expect(await screen.findByText('customer@sole.com', {}, T)).toBeInTheDocument()
    expect(screen.getByText('admin@sole.com')).toBeInTheDocument()
  })
})

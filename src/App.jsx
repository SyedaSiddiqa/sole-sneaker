import { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import gsap from 'gsap'
import LoadingScreen from '@/components/LoadingScreen'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CartDrawer from '@/components/CartDrawer'
import AppToaster from '@/components/AppToaster'
import ProtectedRoute from '@/components/ProtectedRoute'
import Home from '@/pages/Home'
import About from '@/pages/About'
import Products from '@/pages/Products'
import ProductDetails from '@/pages/ProductDetails'
import Contact from '@/pages/Contact'
import Checkout from '@/pages/Checkout'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Wishlist from '@/pages/Wishlist'
import Orders from '@/pages/Orders'
import OrderDetails from '@/pages/OrderDetails'
import Admin from '@/pages/Admin'
import NotFound from '@/pages/NotFound'

export default function App() {
  const [loading, setLoading] = useState(true)
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  useEffect(() => { window.scrollTo(0, 0) }, [location.pathname])

  useEffect(() => {
    if (!loading) gsap.fromTo('#page-content', { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out' })
  }, [loading])

  return (
    <>
      <AppToaster />
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      {!loading && (
        <div id="page-content">
          <Navbar />
          <CartDrawer />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          {!isAdmin && <Footer />}
        </div>
      )}
    </>
  )
}

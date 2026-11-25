import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import gsap from 'gsap'
import { Search, Heart, ShoppingBag, Menu, X, User, LogOut, Package, LayoutDashboard } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/products', label: 'Products' },
  { to: '/contact', label: 'Contact' },
]

const Badge = ({ n }) =>
  n > 0 ? (
    <span className="absolute -top-1 -right-1 bg-gold text-black text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">{n}</span>
  ) : null

export default function Navbar() {
  const navRef = useRef(null)
  const mobileRef = useRef(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const lastScroll = useRef(0)
  const { count: cartCount, setIsOpen: setCartOpen } = useCart()
  const { count: wishCount } = useWishlist()
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    gsap.fromTo(navRef.current, { y: -100, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.2 })
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY
      const hide = current > lastScroll.current && current > 120
      gsap.to(navRef.current, { y: hide ? -120 : 0, duration: 0.4, ease: 'power2.inOut', overwrite: 'auto' })
      lastScroll.current = current
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // close menus on navigation
  useEffect(() => { setMobileOpen(false); setSearchOpen(false) }, [location.pathname])

  useEffect(() => {
    if (!mobileOpen) return
    gsap.fromTo(mobileRef.current, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: 0.5, ease: 'power3.out' })
    gsap.fromTo('.mobile-link', { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, stagger: 0.06, delay: 0.15 })
  }, [mobileOpen])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchValue.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchValue.trim())}`)
      setSearchOpen(false)
      setSearchValue('')
    }
  }

  return (
    <header ref={navRef} className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-6 pt-4">
      <div className="max-w-7xl mx-auto rounded-2xl glass px-5 sm:px-8 py-3.5 flex items-center justify-between" style={{ background: 'var(--navbar)' }}>
        <Link to="/" className="font-display text-2xl tracking-[0.15em] text-gradient-gold">SOLE</Link>

        <nav className="hidden md:flex items-center gap-9">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="relative text-sm font-medium tracking-wide text-text/90 hover:text-gold transition-colors duration-300 group">
              {l.label}
              <span className={cn('absolute -bottom-1 left-0 h-[1px] bg-gold transition-all duration-300 group-hover:w-full', location.pathname === l.to ? 'w-full' : 'w-0')} />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-3">
          <button onClick={() => setSearchOpen((s) => !s)} className="p-2 rounded-full hover:bg-gold/10 transition-colors text-text" aria-label="Search">
            <Search size={18} />
          </button>
          <Link to="/wishlist" className="relative p-2 rounded-full hover:bg-gold/10 transition-colors text-text hidden sm:block" aria-label="Wishlist">
            <Heart size={18} />
            <Badge n={wishCount} />
          </Link>
          <button onClick={() => setCartOpen(true)} className="relative p-2 rounded-full hover:bg-gold/10 transition-colors text-text" aria-label="Cart">
            <ShoppingBag size={18} />
            <Badge n={cartCount} />
          </button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="hidden sm:flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-gold/10 transition-colors outline-none" aria-label="Account">
                <span className="h-8 w-8 rounded-full bg-gold text-black text-xs font-bold flex items-center justify-center uppercase">{user.name?.[0]}</span>
                <span className="text-sm max-w-[90px] truncate">{user.name.split(' ')[0]}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-3 py-2 border-b border-border mb-1">
                  <p className="text-sm font-semibold truncate">{user.name}</p>
                  <p className="text-xs text-text-secondary truncate">{user.email}</p>
                </div>
                {isAdmin && <DropdownMenuItem onClick={() => navigate('/admin')}><LayoutDashboard size={14} className="mr-2" /> Admin Dashboard</DropdownMenuItem>}
                <DropdownMenuItem onClick={() => navigate('/orders')}><Package size={14} className="mr-2" /> My Orders</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/wishlist')}><Heart size={14} className="mr-2" /> Wishlist</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { logout(); navigate('/') }}><LogOut size={14} className="mr-2" /> Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login" className="hidden sm:flex items-center gap-2 p-2 px-3 rounded-full hover:bg-gold/10 transition-colors text-sm" aria-label="Sign in">
              <User size={17} /> Sign in
            </Link>
          )}

          <ThemeToggle className="hidden sm:flex" />
          <button className="md:hidden p-2 text-text" onClick={() => setMobileOpen((o) => !o)} aria-label="Menu">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <form onSubmit={handleSearchSubmit} className="max-w-7xl mx-auto mt-2 rounded-xl glass px-5 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <Search size={16} className="text-gold" />
          <input autoFocus value={searchValue} onChange={(e) => setSearchValue(e.target.value)} placeholder="Search sneakers…" className="flex-1 bg-transparent outline-none text-sm text-text placeholder:text-text-secondary" />
        </form>
      )}

      <div ref={mobileRef} className={cn('md:hidden overflow-hidden max-w-7xl mx-auto', !mobileOpen && 'h-0')}>
        <div className="mt-2 rounded-2xl glass px-6 py-6 flex flex-col gap-5">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="mobile-link text-lg font-display tracking-wide">{l.label}</Link>
          ))}
          <Link to="/wishlist" className="mobile-link text-lg font-display tracking-wide">Wishlist {wishCount > 0 && `(${wishCount})`}</Link>
          {user ? (
            <>
              <Link to="/orders" className="mobile-link text-lg font-display tracking-wide">My Orders</Link>
              {isAdmin && <Link to="/admin" className="mobile-link text-lg font-display tracking-wide text-gold">Admin Dashboard</Link>}
              <button onClick={() => { logout(); navigate('/') }} className="mobile-link text-left text-lg font-display tracking-wide">Sign out ({user.name.split(' ')[0]})</button>
            </>
          ) : (
            <div className="mobile-link flex gap-3">
              <Link to="/login" className="flex-1 h-11 rounded-full border border-border flex items-center justify-center text-sm">Sign in</Link>
              <Link to="/register" className="flex-1 h-11 rounded-full bg-btn-bg text-btn-text flex items-center justify-center text-sm font-semibold">Join</Link>
            </div>
          )}
          <div className="mobile-link flex items-center justify-between pt-3 border-t border-border">
            <span className="text-sm text-text-secondary">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}

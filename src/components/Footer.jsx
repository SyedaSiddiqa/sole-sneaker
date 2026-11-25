import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Instagram, Facebook, Twitter, Linkedin, ArrowRight } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export default function Footer() {
  const ref = useRef(null)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.footer-col',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: ref.current, start: 'top 90%' } }
      )
    }, ref)
    return () => ctx.revert()
  }, [])

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setSubscribed(true)
    setEmail('')
    setTimeout(() => setSubscribed(false), 3500)
  }

  return (
    <footer ref={ref} className="relative mt-20 border-t border-border">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12">
        <div className="footer-col lg:col-span-2">
          <h3 className="font-display text-3xl text-gradient-gold tracking-wide">SOLE</h3>
          <p className="text-sm text-text-secondary mt-2 tracking-widest uppercase">Move Different.</p>
          <div className="flex items-center gap-3 mt-6">
            {[Instagram, Facebook, Twitter, Linkedin].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-text-secondary hover:text-gold hover:border-gold transition-all duration-300 hover:-translate-y-1"
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>

        <div className="footer-col">
          <h4 className="text-xs font-semibold tracking-widest text-gold uppercase mb-4">Navigation</h4>
          <ul className="space-y-3 text-sm text-text-secondary">
            <li><Link to="/" className="hover:text-gold transition-colors">Home</Link></li>
            <li><Link to="/about" className="hover:text-gold transition-colors">About</Link></li>
            <li><Link to="/products" className="hover:text-gold transition-colors">Products</Link></li>
            <li><Link to="/contact" className="hover:text-gold transition-colors">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="text-xs font-semibold tracking-widest text-gold uppercase mb-4">Shop</h4>
          <ul className="space-y-3 text-sm text-text-secondary">
            {['Running', 'Lifestyle', 'Training', 'Signature'].map((c) => (
              <li key={c}>
                <Link to={`/products?category=${c}`} className="hover:text-gold transition-colors">{c}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="text-xs font-semibold tracking-widest text-gold uppercase mb-4">Support</h4>
          <ul className="space-y-3 text-sm text-text-secondary">
            {['FAQ', 'Shipping', 'Warranty', 'Returns'].map((c) => (
              <li key={c}><a href="#" className="hover:text-gold transition-colors">{c}</a></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="footer-col max-w-7xl mx-auto px-6 md:px-10 pb-12">
        <div className="glass rounded-2xl px-6 py-8 md:px-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="font-display text-2xl tracking-wide">STAY IN MOTION</h4>
            <p className="text-sm text-text-secondary mt-1">Get early access to drops & exclusive offers.</p>
          </div>
          <form onSubmit={handleSubscribe} className="flex w-full md:w-auto gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="flex-1 md:w-64 h-12 rounded-full bg-transparent border border-border px-5 text-sm outline-none focus:border-gold transition-colors"
            />
            <button type="submit" className="h-12 px-6 rounded-full bg-btn-bg text-btn-text text-sm font-semibold flex items-center gap-2 hover:brightness-110 transition-all">
              {subscribed ? 'Subscribed ✓' : 'Subscribe'} <ArrowRight size={14} />
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-border py-6 text-center text-xs text-text-secondary">
        © 2026 SOLE. All rights reserved.
      </div>
    </footer>
  )
}

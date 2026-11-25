import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Gem, ShieldCheck, Truck, Headset } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const features = [
  { icon: Gem, title: 'HIGH QUALITY', text: 'Premium materials and carefully crafted footwear.' },
  { icon: ShieldCheck, title: 'WARRANTY PROTECTION', text: 'Reliable warranty coverage for your purchase.' },
  { icon: Truck, title: 'FREE SHIPPING', text: 'Free shipping on eligible orders.' },
  { icon: Headset, title: '24/7 SUPPORT', text: 'Our support team is always ready to help.' },
]

export default function TrustFeatures() {
  const ref = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.trust-card',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: { trigger: ref.current, start: 'top 88%' },
        }
      )
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} className="max-w-7xl mx-auto px-6 md:px-10 py-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="trust-card group relative rounded-2xl glass p-7 gold-border-anim transition-transform duration-500 hover:-translate-y-2"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold transition-all duration-500 group-hover:bg-gold group-hover:text-black group-hover:rotate-6">
              <Icon size={22} />
            </div>
            <h3 className="font-display text-lg tracking-wide mb-2">{title}</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

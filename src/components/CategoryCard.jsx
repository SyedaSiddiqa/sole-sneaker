import { useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ArrowUpRight } from 'lucide-react'

export default function CategoryCard({ range, index }) {
  const cardRef = useRef(null)
  const imgRef = useRef(null)
  const arrowRef = useRef(null)

  const handleMove = (e) => {
    const el = cardRef.current
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    gsap.to(el, { rotateY: x * 10, rotateX: -y * 10, duration: 0.5, ease: 'power2.out', transformPerspective: 800 })
    gsap.to(imgRef.current, { scale: 1.12, duration: 0.6, ease: 'power2.out' })
    gsap.to(arrowRef.current, { x: 5, y: -5, duration: 0.4 })
  }

  const handleLeave = () => {
    gsap.to(cardRef.current, { rotateY: 0, rotateX: 0, duration: 0.6, ease: 'power3.out' })
    gsap.to(imgRef.current, { scale: 1, duration: 0.6, ease: 'power2.out' })
    gsap.to(arrowRef.current, { x: 0, y: 0, duration: 0.4 })
  }

  return (
    <Link
      to={`/products?category=${range.title === 'SIGNATURE' ? 'Signature' : range.title === 'PERFORMANCE' ? 'Running' : 'Lifestyle'}`}
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="range-card group relative rounded-3xl overflow-hidden h-[420px] block gold-border-anim"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        <img ref={imgRef} src={range.image} alt={range.title} loading="lazy" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ boxShadow: 'inset 0 0 80px rgba(212,175,55,0.25)' }} />

      <div className="relative h-full flex flex-col justify-end p-8 text-white">
        <span className="text-xs tracking-[0.3em] text-gold-light mb-2">0{index + 1}</span>
        <h3 className="font-display text-4xl mb-2">{range.title}</h3>
        <p className="text-sm text-white/70 mb-5">{range.desc}</p>
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="border-b border-transparent group-hover:border-gold-light transition-all">Explore</span>
          <ArrowUpRight ref={arrowRef} size={16} />
        </div>
      </div>
    </Link>
  )
}

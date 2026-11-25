import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import Hero3D from '@/components/Hero3D'
import SectionHeading from '@/components/SectionHeading'
import CategoryCard from '@/components/CategoryCard'
import ProductGrid from '@/components/ProductGrid'
import Gallery from '@/components/Gallery'
import TrustFeatures from '@/components/TrustFeatures'
import MagneticButton from '@/components/MagneticButton'
import { ranges } from '@/data/categories'
import { api } from '@/lib/api'

gsap.registerPlugin(ScrollTrigger)

export default function Home() {
  const heroRef = useRef(null)
  const progress = useRef(0) // 0..1 hero scroll progress, read every frame by the 3D scene
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const ctrl = new AbortController()
    api.get('/products?featured=true&limit=6&sort=popular', { signal: ctrl.signal })
      .then((d) => setFeatured(d.products))
      .catch((e) => e.name !== 'AbortError' && setError(e.message))
      .finally(() => setLoading(false))
    return () => ctrl.abort()
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 })
      tl.fromTo('.hero-eyebrow', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' })
        .fromTo('.hero-title span.inner', { y: '110%' }, { y: '0%', duration: 1, stagger: 0.12, ease: 'power4.out' }, '-=0.3')
        .fromTo('.hero-sub', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, '-=0.5')
        .fromTo('.hero-cta', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: 'power3.out' }, '-=0.5')

      // Scroll-driven sneaker: progress feeds the R3F scene (spin, lift, shrink); the canvas wrapper also parallaxes
      ScrollTrigger.create({
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => { progress.current = self.progress },
      })
      gsap.to('.hero-3d', {
        yPercent: -8,
        scale: 0.92,
        ease: 'none',
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: 1 },
      })
      gsap.to('.hero-parallax', {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: 1 },
      })
      gsap.to('.hero-copy', {
        yPercent: -12,
        opacity: 0.2,
        ease: 'none',
        scrollTrigger: { trigger: heroRef.current, start: 'center top', end: 'bottom top', scrub: 1 },
      })

      gsap.utils.toArray('.story-line').forEach((line) => {
        gsap.fromTo(line, { opacity: 0.15, y: 20 }, { opacity: 1, y: 0, scrollTrigger: { trigger: line, start: 'top 85%', end: 'top 55%', scrub: true } })
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <div>
      {/* HERO */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden pt-28 pb-10">
        <div className="hero-parallax glow-orb w-[600px] h-[600px] -top-40 -right-40" style={{ background: 'var(--glow-tr)' }} />
        <div className="hero-parallax glow-orb w-[500px] h-[500px] -bottom-32 -left-40" style={{ background: 'var(--glow-bl)' }} />

        <div className="relative max-w-7xl mx-auto px-6 md:px-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">
          <div className="hero-copy relative z-10 text-center lg:text-left order-2 lg:order-1">
            <span className="hero-eyebrow inline-block text-xs tracking-[0.35em] text-gold uppercase mb-5">Premium 3D Sneaker Experience</span>
            <h1 className="hero-title font-display text-6xl sm:text-7xl md:text-8xl leading-[0.92] mb-6">
              <span className="split-line"><span className="inner inline-block">MOVE</span></span>
              <span className="split-line"><span className="inner inline-block text-gradient-gold">DIFFERENT.</span></span>
            </h1>
            <p className="hero-sub text-text-secondary text-base md:text-lg max-w-md mx-auto lg:mx-0 mb-9">Engineered for movement. Designed for impact.</p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <MagneticButton className="hero-cta">
                <Link to="/products" className="inline-flex items-center gap-2 h-14 px-9 rounded-full bg-btn-bg text-btn-text font-semibold tracking-wide hover:shadow-[0_10px_40px_-8px_rgb(var(--gold)/0.6)] transition-shadow duration-500">
                  SHOP NOW <ArrowRight size={16} />
                </Link>
              </MagneticButton>
              <MagneticButton className="hero-cta">
                <Link to="/products" className="inline-flex items-center gap-2 h-14 px-9 rounded-full border border-border hover:border-gold text-text hover:text-gold transition-colors duration-500">
                  EXPLORE COLLECTION
                </Link>
              </MagneticButton>
            </div>
          </div>

          <div className="hero-3d relative h-[380px] sm:h-[480px] lg:h-[640px] z-10 order-1 lg:order-2 -mx-6 sm:mx-0">
            <Hero3D progressRef={progress} />
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[10px] tracking-[0.3em] text-text-secondary uppercase">
          Scroll
          <span className="h-8 w-[1px] bg-gradient-to-b from-gold to-transparent animate-pulse" />
        </div>
      </section>

      {/* BROWSE THE RANGE */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-24">
        <SectionHeading eyebrow="Collections" title="BROWSE THE RANGE" subtitle="Find the pair that moves with you." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ranges.map((r, i) => <CategoryCard key={r.id} range={r} index={i} />)}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-24">
        <SectionHeading eyebrow="Selected For You" title="FEATURED PRODUCTS" subtitle="Our most coveted styles, engineered to perform." />
        <ProductGrid
          products={featured}
          loading={loading}
          emptyTitle={error ? 'Could not load products' : 'No featured products yet'}
          emptyText={error || 'Check back soon.'}
        />
        <div className="text-center mt-14">
          <Link to="/products" className="inline-flex items-center gap-2 text-sm font-semibold tracking-widest uppercase text-gold hover:gap-3 transition-all duration-300">
            View All Products <ArrowUpRight size={15} />
          </Link>
        </div>
      </section>

      {/* GALLERY */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-24">
        <SectionHeading eyebrow="Visual Stories" title="THE SOLE GALLERY" subtitle="A closer look at the craft behind every pair." />
        <Gallery />
      </section>

      {/* BRAND STORY */}
      <section className="relative py-32 overflow-hidden">
        <div className="glow-orb w-[500px] h-[500px] top-0 right-0" style={{ background: 'var(--hero-glow)' }} />
        <div className="max-w-5xl mx-auto px-6 md:px-10 text-center relative z-10">
          <span className="text-xs tracking-[0.35em] text-gold uppercase mb-6 block">Our Philosophy</span>
          <h2 className="font-display text-5xl sm:text-6xl md:text-7xl leading-[0.95] mb-10"><span className="story-line block">BUILT TO MOVE.</span></h2>
          <p className="story-line text-lg md:text-2xl text-text-secondary leading-relaxed max-w-3xl mx-auto">
            SOLE combines relentless innovation, all-day comfort, elite performance engineering, and premium materials into footwear defined by modern, minimal design.
          </p>
        </div>
      </section>

      <TrustFeatures />
    </div>
  )
}

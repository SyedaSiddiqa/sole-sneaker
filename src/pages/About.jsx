import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SectionHeading from '@/components/SectionHeading'
import TrustFeatures from '@/components/TrustFeatures'
import useCountUp from '@/hooks/useCountUp'
import { timeline, stats, categoryList } from '@/data/categories'

gsap.registerPlugin(ScrollTrigger)

function StatItem({ stat }) {
  const [ref, value] = useCountUp(stat.value, stat.decimals || 0)
  return (
    <div ref={ref} className="text-center">
      <p className="font-display text-5xl md:text-6xl text-gradient-gold">
        {value.toLocaleString()}{stat.suffix}
      </p>
      <p className="text-xs tracking-widest uppercase text-text-secondary mt-2">{stat.label}</p>
    </div>
  )
}

export default function About() {
  const heroRef = useRef(null)
  const timelineRef = useRef(null)

  useEffect(() => {
    gsap.fromTo('.about-hero-el', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.15, ease: 'power3.out', delay: 0.2 })

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.timeline-item',
        { opacity: 0, x: -40 },
        {
          opacity: 1,
          x: 0,
          duration: 0.9,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: { trigger: timelineRef.current, start: 'top 75%' },
        }
      )
      gsap.fromTo(
        '.timeline-line',
        { scaleY: 0 },
        { scaleY: 1, transformOrigin: 'top', ease: 'none', scrollTrigger: { trigger: timelineRef.current, start: 'top 70%', end: 'bottom 80%', scrub: 1 } }
      )
      gsap.fromTo(
        '.about-cat-card',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.about-cats', start: 'top 85%' } }
      )
    })
    return () => ctx.revert()
  }, [])

  return (
    <div>
      <section ref={heroRef} className="relative pt-40 pb-24 text-center overflow-hidden">
        <div className="glow-orb w-[500px] h-[500px] -top-32 left-1/2 -translate-x-1/2" style={{ background: 'var(--hero-glow)' }} />
        <div className="relative max-w-3xl mx-auto px-6">
          <span className="about-hero-el inline-block text-xs tracking-[0.35em] text-gold uppercase mb-5">Est. 2018</span>
          <h1 className="about-hero-el font-display text-6xl sm:text-7xl md:text-8xl mb-6">OUR JOURNEY</h1>
          <p className="about-hero-el text-text-secondary text-lg">From an idea to a movement.</p>
        </div>
      </section>

      {/* TIMELINE */}
      <section ref={timelineRef} className="max-w-4xl mx-auto px-6 md:px-10 py-20 relative">
        <div className="timeline-line absolute left-[27px] md:left-1/2 top-0 bottom-0 w-[2px] bg-gold/30 md:-translate-x-1/2" />
        <div className="space-y-16">
          {timeline.map((t, i) => (
            <div key={t.year} className={`timeline-item relative flex items-start gap-6 md:gap-0 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
              <div className="absolute left-[19px] md:left-1/2 top-1 h-4 w-4 rounded-full bg-gold md:-translate-x-1/2 shadow-[0_0_20px_rgb(var(--gold)/0.6)]" />
              <div className={`pl-14 md:pl-0 md:w-1/2 ${i % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:pl-16'}`}>
                <span className="text-xs tracking-widest text-gold uppercase">{t.year}</span>
                <h3 className="font-display text-3xl mt-1 mb-2">{t.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{t.text}</p>
              </div>
              <div className="hidden md:block md:w-1/2" />
            </div>
          ))}
        </div>
      </section>

      {/* TRUSTED WORLDWIDE */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 py-24">
        <SectionHeading eyebrow="Global Impact" title="TRUSTED WORLDWIDE" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {stats.map((s) => (
            <StatItem key={s.label} stat={s} />
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="about-cats max-w-6xl mx-auto px-6 md:px-10 py-24">
        <SectionHeading eyebrow="What We Make" title="OUR CATEGORIES" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categoryList.map((c) => (
            <Link
              key={c}
              to={`/products?category=${c}`}
              className="about-cat-card group rounded-2xl glass p-8 text-center gold-border-anim transition-transform duration-500 hover:-translate-y-2"
            >
              <h3 className="font-display text-2xl group-hover:text-gold transition-colors">{c}</h3>
            </Link>
          ))}
        </div>
      </section>

      <TrustFeatures />
    </div>
  )
}

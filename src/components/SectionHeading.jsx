import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cn } from '@/lib/utils'

gsap.registerPlugin(ScrollTrigger)

export default function SectionHeading({ eyebrow, title, subtitle, align = 'center', className }) {
  const ref = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const els = ref.current.querySelectorAll('.reveal-el')
      gsap.fromTo(
        els,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 85%',
          },
        }
      )
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        'mb-14',
        align === 'center' ? 'text-center mx-auto max-w-2xl' : 'text-left',
        className
      )}
    >
      {eyebrow && (
        <span className="reveal-el inline-block text-xs font-semibold tracking-[0.3em] text-gold uppercase mb-3">
          {eyebrow}
        </span>
      )}
      <h2 className="reveal-el font-display text-4xl sm:text-5xl md:text-6xl leading-[0.95] mb-4">
        {title}
      </h2>
      {subtitle && <p className="reveal-el text-text-secondary text-base md:text-lg">{subtitle}</p>}
    </div>
  )
}

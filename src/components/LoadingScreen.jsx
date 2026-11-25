import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

export default function LoadingScreen({ onComplete }) {
  const [percent, setPercent] = useState(1)
  const containerRef = useRef(null)
  const barRef = useRef(null)
  const logoRef = useRef(null)
  const counterObj = useRef({ val: 1 })

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        const exitTl = gsap.timeline({
          onComplete: () => onComplete?.(),
        })
        exitTl
          .to(logoRef.current, { scale: 1.15, opacity: 0, duration: 0.5, ease: 'power2.in' })
          .to(
            containerRef.current,
            { yPercent: -100, duration: 1, ease: 'power4.inOut' },
            '-=0.2'
          )
      },
    })

    tl.fromTo(logoRef.current, { opacity: 0, y: 30, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out' })
      .to(counterObj.current, {
        val: 100,
        duration: 2.6,
        ease: 'power2.inOut',
        onUpdate: () => setPercent(Math.floor(counterObj.current.val)),
      }, '-=0.3')
      .to(barRef.current, { width: '100%', duration: 2.6, ease: 'power2.inOut' }, '<')
      .to({}, { duration: 0.4 })

    return () => tl.kill()
  }, [onComplete])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'var(--bg-grad)' }}
    >
      <div className="glow-orb w-[500px] h-[500px] -top-20 -right-20" style={{ background: 'var(--hero-glow)' }} />
      <div className="glow-orb w-[400px] h-[400px] -bottom-20 -left-20" style={{ background: 'var(--glow-bl)' }} />

      <div ref={logoRef} className="relative flex flex-col items-center">
        <h1 className="font-display text-6xl sm:text-8xl tracking-widest text-gradient-gold">SOLE</h1>
        <p className="mt-3 text-xs sm:text-sm tracking-[0.5em] text-text-secondary uppercase">Loading Experience</p>

        <div className="mt-10 w-64 sm:w-80 h-[2px] bg-gold/15 rounded-full overflow-hidden">
          <div ref={barRef} className="h-full w-0 bg-gradient-to-r from-gold via-gold-light to-gold rounded-full" />
        </div>

        <div className="mt-5 font-display text-3xl tabular-nums text-gold tracking-wider">
          {percent}%
        </div>
      </div>
    </div>
  )
}

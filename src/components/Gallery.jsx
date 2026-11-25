import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { galleryImages } from '@/data/categories'

gsap.registerPlugin(ScrollTrigger)

const spans = ['row-span-2', '', 'row-span-2', '', '', 'row-span-2', '']
const speeds = [0.6, 1, 0.7, 1.1, 0.9, 0.65, 1]

export default function Gallery() {
  const containerRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray('.gallery-item')
      gsap.fromTo(
        items,
        { opacity: 0, y: 70, scale: 0.94 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: { trigger: containerRef.current, start: 'top 80%' },
        }
      )

      items.forEach((item, i) => {
        gsap.to(item, {
          y: () => (i % 2 === 0 ? -40 : -70) * speeds[i % speeds.length],
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        })
      })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="grid grid-cols-2 md:grid-cols-4 auto-rows-[160px] md:auto-rows-[190px] gap-4">
      {galleryImages.map((src, i) => (
        <div
          key={i}
          className={`gallery-item relative overflow-hidden rounded-2xl group ${spans[i % spans.length]}`}
        >
          <img
            src={src}
            loading="lazy"
            alt="SOLE sneaker gallery"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-115 group-hover:rotate-1"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      ))}
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function useCountUp(target, decimals = 0) {
  const ref = useRef(null)
  const [value, setValue] = useState(0)

  useEffect(() => {
    const obj = { val: 0 }
    const st = ScrollTrigger.create({
      trigger: ref.current,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: 'power2.out',
          onUpdate: () => setValue(Number(obj.val.toFixed(decimals))),
        })
      },
    })
    return () => st.kill()
  }, [target, decimals])

  return [ref, value]
}

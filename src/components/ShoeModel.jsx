import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'

export const SNEAKER_URL = '/models/sneaker.glb'
const TARGET_LENGTH = 3.1 // world units along the shoe's long axis

// Kick off the download as soon as this module is imported (runs during the loading screen)
useGLTF.preload(SNEAKER_URL)

/**
 * Realistic sneaker (glTF, PBR textured — see public/models/CREDITS.txt).
 *  - mouseRef:    { current: {x, y} } normalised pointer position (-1..1)
 *  - progressRef: { current: 0..1 } hero scroll progress (driven by GSAP ScrollTrigger)
 */
export default function ShoeModel({ mouseRef, progressRef, reducedMotion = false, ...props }) {
  const { scene } = useGLTF(SNEAKER_URL)
  const intro = useRef()
  const rig = useRef()
  const smooth = useRef({ p: 0 })

  // Clone + normalise: centre the model and scale it to a consistent size
  const { object, scale, offset } = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true
        o.receiveShadow = true
        if (o.material) {
          o.material = o.material.clone()
          o.material.envMapIntensity = 1.35
          if (o.material.map) o.material.map.anisotropy = 8
        }
      }
    })
    const box = new THREE.Box3().setFromObject(clone)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const s = TARGET_LENGTH / Math.max(size.x, size.z)
    return { object: clone, scale: s, offset: center.multiplyScalar(-s) }
  }, [scene])

  // Cinematic GSAP entrance: spin in + scale up
  useLayoutEffect(() => {
    if (!intro.current) return
    if (reducedMotion) { intro.current.scale.setScalar(1); return }
    const ctx = gsap.context(() => {
      gsap.fromTo(intro.current.scale, { x: 0.35, y: 0.35, z: 0.35 }, { x: 1, y: 1, z: 1, duration: 1.8, ease: 'expo.out' })
      gsap.fromTo(intro.current.rotation, { y: -Math.PI * 1.4 }, { y: 0, duration: 2.2, ease: 'power3.out' })
      gsap.fromTo(intro.current.position, { y: -1.2 }, { y: 0, duration: 1.8, ease: 'power3.out' })
    })
    return () => ctx.revert()
  }, [reducedMotion])

  useEffect(() => () => object.traverse((o) => o.isMesh && o.material?.dispose()), [object])

  useFrame((state, delta) => {
    if (!rig.current) return
    const t = state.clock.elapsedTime
    const m = mouseRef?.current || { x: 0, y: 0 }
    const target = progressRef?.current || 0
    smooth.current.p = THREE.MathUtils.damp(smooth.current.p, target, 4, delta)
    const p = smooth.current.p

    // slow turntable + mouse parallax + scroll-driven spin
    const spin = reducedMotion ? 0 : t * 0.22
    const ry = -0.55 + spin + m.x * 0.55 + p * Math.PI * 1.1
    const rx = m.y * 0.22 + p * 0.25
    rig.current.rotation.y = THREE.MathUtils.damp(rig.current.rotation.y, ry, 3.5, delta)
    rig.current.rotation.x = THREE.MathUtils.damp(rig.current.rotation.x, rx, 3.5, delta)
    rig.current.rotation.z = THREE.MathUtils.damp(rig.current.rotation.z, 0.06 - p * 0.18, 3.5, delta)

    // float + scroll lift / shrink
    rig.current.position.y = (reducedMotion ? 0 : Math.sin(t * 0.9) * 0.1) + p * 0.55
    rig.current.position.x = p * 0.5
    rig.current.scale.setScalar(1 - p * 0.28)
  })

  return (
    <group ref={intro} {...props}>
      <group ref={rig}>
        <primitive object={object} scale={scale} position={offset} />
      </group>
    </group>
  )
}

import { Component, Suspense, useEffect, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Html, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import ShoeModel from './ShoeModel'
import ParticleField from './ParticleField'

// If WebGL or the model fails, degrade gracefully instead of crashing the page
class Model3DBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(err) { console.warn('3D scene failed to load:', err) }
  render() {
    if (this.state.failed) {
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-7xl sm:text-8xl tracking-[0.2em] text-gradient-gold opacity-40">SOLE</span>
        </div>
      )
    }
    return this.props.children
  }
}

// Keeps the whole shoe in frame on narrow screens; `zoom` (1 = default) is lerped for smooth zooming
function ResponsiveCamera({ zoom }) {
  const { camera, size } = useThree()
  const target = useRef(6)
  useEffect(() => {
    const aspect = size.width / size.height
    target.current = (aspect < 0.85 ? 8.2 : aspect < 1.2 ? 6.6 : 6) / zoom
  }, [size, zoom])
  useEffect(() => {
    let raf
    const tick = () => {
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, target.current, 0.08)
      camera.position.y = 0.55
      camera.lookAt(0, 0, 0)
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [camera])
  return null
}

function Loader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 text-[10px] tracking-[0.35em] uppercase text-gold whitespace-nowrap">
        <span className="h-8 w-8 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
        Loading 3D
      </div>
    </Html>
  )
}

// A procedural "photo studio": soft boxes + a gold accent strip. No HDR download required.
function Studio() {
  return (
    <Environment resolution={256}>
      <color attach="background" args={['#000']} />
      <Lightformer form="rect" intensity={5} position={[0, 6, 2]} scale={[12, 6, 1]} rotation-x={Math.PI / 2} />
      <Lightformer form="rect" intensity={2.4} position={[-6, 1.5, 1]} scale={[8, 3, 1]} rotation-y={Math.PI / 2} />
      <Lightformer form="rect" intensity={2.4} position={[6, 1.5, 1]} scale={[8, 3, 1]} rotation-y={-Math.PI / 2} />
      <Lightformer form="rect" intensity={1.6} position={[0, 1, -7]} scale={[14, 3, 1]} />
      <Lightformer form="ring" color="#D4AF37" intensity={4} position={[-3, 2, -4]} scale={4} />
      <Lightformer form="rect" color="#F0D477" intensity={2.2} position={[4, -1, -3]} scale={[6, 1, 1]} />
    </Environment>
  )
}

/**
 * Props:
 *  - progressRef: scroll progress ref (0..1) for scroll-driven animation
 *  - zoom:        camera zoom multiplier (product page buttons)
 */
export default function Hero3D({ progressRef, zoom = 1, className = '' }) {
  const mouse = useRef({ x: 0, y: 0 })
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  useEffect(() => {
    if (reducedMotion) return
    const onMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [reducedMotion])

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* premium backdrop: soft gold radial glow behind the shoe */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 55% at 50% 52%, var(--hero-glow), transparent 70%)' }}
      />
      <Model3DBoundary>
        <Canvas
          shadows={!isMobile}
          dpr={isMobile ? [1, 1.5] : [1, 2]}
          camera={{ position: [0, 0.55, 6], fov: 38 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
        >
          <ResponsiveCamera zoom={zoom} />
          <ambientLight intensity={0.25} />
          <directionalLight position={[3.5, 6, 4]} intensity={1.6} color="#fff3d6" castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} />
          <pointLight position={[-4, 1.5, -3]} intensity={18} distance={14} color="#D4AF37" />
          <spotLight position={[0, 5, -3]} intensity={30} angle={0.6} penumbra={1} color="#F0D477" />

          <Suspense fallback={<Loader />}>
            <ShoeModel mouseRef={mouse} progressRef={progressRef} reducedMotion={reducedMotion} />
            {!reducedMotion && <ParticleField count={isMobile ? 60 : 140} />}

            {/* gold podium rings */}
            <group position={[0, -1.12, 0]} rotation-x={-Math.PI / 2}>
              <mesh>
                <ringGeometry args={[2.05, 2.09, 128]} />
                <meshBasicMaterial color="#D4AF37" transparent opacity={0.85} />
              </mesh>
              <mesh>
                <ringGeometry args={[2.45, 2.465, 128]} />
                <meshBasicMaterial color="#D4AF37" transparent opacity={0.35} />
              </mesh>
            </group>
            <ContactShadows position={[0, -1.1, 0]} opacity={0.55} scale={9} blur={2.6} far={2.4} color="#000" />
            <Studio />
          </Suspense>
        </Canvas>
      </Model3DBoundary>
    </div>
  )
}

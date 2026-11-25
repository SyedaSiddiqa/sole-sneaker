import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => { cleanup(); localStorage.clear() })

// jsdom gaps used by GSAP / Radix / the app
window.matchMedia = window.matchMedia || ((q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent() {} }))
window.scrollTo = vi.fn()
Element.prototype.scrollIntoView = vi.fn()
Element.prototype.hasPointerCapture = Element.prototype.hasPointerCapture || (() => false)
Element.prototype.setPointerCapture = Element.prototype.setPointerCapture || (() => {})
Element.prototype.releasePointerCapture = Element.prototype.releasePointerCapture || (() => {})
globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} unobserve() {} disconnect() {} }
globalThis.IntersectionObserver = globalThis.IntersectionObserver || class { observe() {} unobserve() {} disconnect() {} takeRecords() { return [] } }

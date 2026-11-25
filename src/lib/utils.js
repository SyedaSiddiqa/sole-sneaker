import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatPrice(n) {
  return `$${n.toFixed(2)}`
}

// Inline placeholder shown if a product image URL fails to load
export const FALLBACK_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1a1608"/><stop offset="1" stop-color="#0a0a0a"/></linearGradient></defs><rect width="800" height="600" fill="url(#g)"/><text x="400" y="320" text-anchor="middle" font-family="Arial Black,sans-serif" font-size="96" letter-spacing="14" fill="#D4AF37" opacity=".55">SOLE</text></svg>`
  )

export const onImgError = (e) => {
  if (e.currentTarget.src !== FALLBACK_IMG) e.currentTarget.src = FALLBACK_IMG
}

export const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

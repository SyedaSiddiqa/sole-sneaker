import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="font-display text-8xl text-gradient-gold mb-4">404</h1>
      <p className="text-text-secondary mb-8">This page has moved differently than expected.</p>
      <Button asChild><Link to="/">Back Home</Link></Button>
    </div>
  )
}

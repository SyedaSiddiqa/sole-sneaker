import { Navigate, useLocation } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'

export function PageSpinner() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <span className="h-10 w-10 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
    </div>
  )
}

// <ProtectedRoute>            -> any signed-in user
// <ProtectedRoute adminOnly>  -> admins only (role-based)
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageSpinner />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  if (adminOnly && user.role !== 'admin') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
        <ShieldAlert size={44} className="text-gold mb-4" />
        <h1 className="font-display text-4xl mb-2">ACCESS DENIED</h1>
        <p className="text-text-secondary mb-8">This area is restricted to administrators.</p>
        <Button asChild><Link to="/">Back Home</Link></Button>
      </div>
    )
  }
  return children
}

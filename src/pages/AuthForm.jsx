import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import FormField from '@/components/FormField'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

const emailRx = /^\S+@\S+\.\S+$/

// Shared by /login and /register
export default function AuthForm({ mode }) {
  const isRegister = mode === 'register'
  const { user, login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'
  const [values, setValues] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [show, setShow] = useState(false)

  useEffect(() => {
    gsap.fromTo('.auth-card', { y: 40, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 0.9, ease: 'power3.out' })
    gsap.fromTo('.auth-field', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.07, delay: 0.25, ease: 'power3.out' })
  }, [mode])

  if (user && !submitting) return <Navigate to={from} replace />

  const set = (k) => (e) => { setValues((v) => ({ ...v, [k]: e.target.value })); setErrors((er) => ({ ...er, [k]: '' })) }

  const validate = () => {
    const e = {}
    if (isRegister && values.name.trim().length < 2) e.name = 'Please enter your name'
    if (!emailRx.test(values.email.trim())) e.email = 'Enter a valid email address'
    if (isRegister) {
      if (values.password.length < 8) e.password = 'At least 8 characters'
      else if (!/[A-Za-z]/.test(values.password) || !/\d/.test(values.password)) e.password = 'Include a letter and a number'
      if (values.confirm !== values.password) e.confirm = 'Passwords do not match'
    } else if (!values.password) e.password = 'Enter your password'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (ev) => {
    ev.preventDefault()
    setServerError('')
    if (!validate()) return
    setSubmitting(true)
    try {
      const u = isRegister
        ? await register(values.name.trim(), values.email.trim(), values.password)
        : await login(values.email.trim(), values.password)
      toast.success(isRegister ? `Welcome to SOLE, ${u.name.split(' ')[0]}` : `Welcome back, ${u.name.split(' ')[0]}`)
      navigate(u.role === 'admin' && from === '/' ? '/admin' : from, { replace: true })
    } catch (err) {
      setServerError(err.message)
      gsap.fromTo('.auth-card', { x: -8 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' })
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-28 pb-16 relative overflow-hidden">
      <div className="glow-orb w-[500px] h-[500px] -top-20 -right-20" style={{ background: 'var(--glow-tr)' }} />
      <div className="glow-orb w-[400px] h-[400px] -bottom-20 -left-20" style={{ background: 'var(--glow-bl)' }} />
      <div className="auth-card relative w-full max-w-md glass rounded-3xl p-8 sm:p-10">
        <Link to="/" className="font-display text-3xl tracking-[0.15em] text-gradient-gold block text-center mb-1">SOLE</Link>
        <p className="text-center text-xs tracking-[0.3em] text-text-secondary uppercase mb-8">Move Different.</p>
        <h1 className="font-display text-3xl mb-1 auth-field">{isRegister ? 'CREATE ACCOUNT' : 'WELCOME BACK'}</h1>
        <p className="text-sm text-text-secondary mb-7 auth-field">{isRegister ? 'Join SOLE for faster checkout and order tracking.' : 'Sign in to view your bag, wishlist and orders.'}</p>

        <form onSubmit={submit} noValidate className="space-y-5">
          {isRegister && <FormField className="auth-field" id="name" value={values.name} onChange={set('name')} error={errors.name} label="Full name" autoComplete="name" placeholder="John Doe" />}
          <FormField className="auth-field" id="email" value={values.email} onChange={set('email')} error={errors.email} label="Email" type="email" autoComplete="email" placeholder="you@example.com" />
          <FormField className="auth-field" id="password" value={values.password} onChange={set('password')} error={errors.password} label="Password" type={show ? 'text' : 'password'} autoComplete={isRegister ? 'new-password' : 'current-password'} placeholder={isRegister ? 'Min 8 characters, letter + number' : '••••••••'}>
            <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-gold">
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </FormField>
          {isRegister && <FormField className="auth-field" id="confirm" value={values.confirm} onChange={set('confirm')} error={errors.confirm} label="Confirm password" type={show ? 'text' : 'password'} autoComplete="new-password" placeholder="Repeat password" />}

          {serverError && <p role="alert" className="text-sm text-red-500 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">{serverError}</p>}

          <Button type="submit" size="lg" className="w-full auth-field" disabled={submitting}>
            {submitting ? <><Loader2 size={16} className="animate-spin" /> Please wait…</> : isRegister ? 'CREATE ACCOUNT' : 'SIGN IN'}
          </Button>
        </form>

        <p className="text-sm text-text-secondary text-center mt-7 auth-field">
          {isRegister ? 'Already have an account?' : 'New to SOLE?'}{' '}
          <Link to={isRegister ? '/login' : '/register'} state={location.state} className="text-gold font-semibold hover:underline">{isRegister ? 'Sign in' : 'Create an account'}</Link>
        </p>
        {import.meta.env.DEV && !isRegister && (
          <p className="text-[11px] text-text-secondary/70 text-center mt-4">Dev demo — customer@sole.com / Customer@123 · admin@sole.com / Admin@12345</p>
        )}
      </div>
    </div>
  )
}

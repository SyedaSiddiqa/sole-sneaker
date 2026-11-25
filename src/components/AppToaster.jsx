import { Toaster } from 'sonner'
import { useTheme } from '@/context/ThemeContext'

export default function AppToaster() {
  const { theme } = useTheme()
  return (
    <Toaster
      theme={theme}
      position="top-right"
      offset={88}
      toastOptions={{
        style: {
          background: 'var(--card-solid)',
          color: 'rgb(var(--text))',
          border: '1px solid var(--border)',
          fontFamily: 'Inter, sans-serif',
        },
      }}
    />
  )
}

import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { cn } from '@/lib/utils'

export default function ThemeToggle({ className }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={cn(
        'relative flex items-center w-14 h-8 rounded-full border border-border px-1 transition-colors duration-500',
        isDark ? 'bg-black/40' : 'bg-black/5',
        className
      )}
    >
      <span
        className="absolute top-1 flex items-center justify-center h-6 w-6 rounded-full shadow-md transition-all duration-500 ease-out"
        style={{
          left: isDark ? 'calc(100% - 1.75rem)' : '0.25rem',
          background: 'var(--toggle-circle)',
        }}
      >
        {isDark ? <Moon size={13} color="var(--toggle-icon)" /> : <Sun size={13} color="var(--toggle-icon)" />}
      </span>
    </button>
  )
}

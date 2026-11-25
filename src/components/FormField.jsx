import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

// Defined at module level so inputs keep focus while typing
export default function FormField({ id, label, error, className, children, ...inputProps }) {
  return (
    <div className={className}>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative mt-2">
        <Input id={id} aria-invalid={!!error} className={cn(error && 'border-red-500/70')} {...inputProps} />
        {children}
      </div>
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  )
}

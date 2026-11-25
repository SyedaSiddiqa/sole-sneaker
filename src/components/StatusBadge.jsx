import { cn } from '@/lib/utils'

const styles = {
  Pending: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  Processing: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
  Shipped: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
  Delivered: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  Cancelled: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30',
}

export default function StatusBadge({ status, className }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wider uppercase', styles[status], className)}>
      {status}
    </span>
  )
}

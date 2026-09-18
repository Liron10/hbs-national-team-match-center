import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="empty-state" role="status">
      {icon}
      <p className="empty-state__title">{title}</p>
      {description ? <p className="empty-state__copy">{description}</p> : null}
    </div>
  )
}

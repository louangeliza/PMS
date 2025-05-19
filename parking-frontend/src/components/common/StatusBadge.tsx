import { ReactNode } from 'react'
import React from 'react'
type StatusBadgeProps = {
  status: 'pending' | 'approved' | 'rejected' | 'available' | 'unavailable'
  children: ReactNode
}

export default function StatusBadge({ status, children }: StatusBadgeProps) {
  const statusClasses = {
    pending: 'bg-warning-light text-warning-dark',
    approved: 'bg-success-light text-success-dark',
    rejected: 'bg-danger-light text-danger-dark',
    available: 'bg-success-light text-success-dark',
    unavailable: 'bg-danger-light text-danger-dark',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status]}`}>
      {children}
    </span>
  )
}

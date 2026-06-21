'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Fil d'Ariane" className={cn('flex items-center gap-1.5 text-sm text-muted-foreground mb-6', className)}>
      <Link href="/" className="hover:text-primary transition-colors font-medium">Accueil</Link>
      {items.map((item, idx) => (
        <span key={idx} className="flex items-center gap-1.5">
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          {item.href && idx < items.length - 1 ? (
            <Link href={item.href} className="hover:text-primary transition-colors font-medium">
              {item.label}
            </Link>
          ) : (
            <span className="font-bold text-foreground truncate max-w-[200px]">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

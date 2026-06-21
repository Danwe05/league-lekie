'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  pageSize: number
  total: number
}

export function Pagination({ page, pageSize, total }: PaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const totalPages = Math.ceil(total / pageSize)

  if (totalPages <= 1) return null

  const go = (p: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(p))
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-3 justify-end mt-4">
      <span className="text-sm text-muted-foreground">
        Page {page} / {totalPages}
        <span className="ml-2 text-xs">({total} résultats)</span>
      </span>
      <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => go(page - 1)}>
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => go(page + 1)}>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  )
}

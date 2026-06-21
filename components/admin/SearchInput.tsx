'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useRef } from 'react'

interface SearchInputProps {
  placeholder?: string
  paramName?: string
}

export function SearchInput({ placeholder = 'Rechercher…', paramName = 'q' }: SearchInputProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = (value: string) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(paramName, value)
      } else {
        params.delete(paramName)
      }
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`)
    }, 350)
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        className="pl-9 w-64"
        placeholder={placeholder}
        defaultValue={searchParams.get(paramName) ?? ''}
        onChange={e => handleChange(e.target.value)}
      />
    </div>
  )
}

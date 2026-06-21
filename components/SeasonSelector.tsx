'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SeasonSelectorProps {
  seasons: string[]
  currentSeason?: string
}

export function SeasonSelector({ seasons, currentSeason }: SeasonSelectorProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleChange = (season: string | null) => {
    if (season === null) return
    const params = new URLSearchParams(searchParams.toString())
    if (season === 'all') {
      params.delete('season')
    } else {
      params.set('season', season)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <Select value={currentSeason ?? 'all'} onValueChange={handleChange}>
      <SelectTrigger className="w-40 font-bold">
        <SelectValue placeholder="Saison…" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Toutes les saisons</SelectItem>
        {seasons.map(s => (
          <SelectItem key={s} value={s}>{s}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

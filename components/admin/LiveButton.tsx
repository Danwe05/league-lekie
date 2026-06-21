'use client'

import { useTransition } from 'react'
import { setMatchLive, setMatchFinished, setMatchUpcoming } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { MatchStatus } from '@/lib/types'
import { Radio } from 'lucide-react'

interface LiveButtonProps {
  matchId: string
  currentStatus: MatchStatus
}

export function LiveButton({ matchId, currentStatus }: LiveButtonProps) {
  const [isPending, startTransition] = useTransition()

  if (currentStatus === 'LIVE') {
    return (
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="ghost"
          className="text-green-700 bg-green-100 hover:bg-green-200 font-bold text-xs gap-1.5 border border-green-200 h-8"
          disabled={isPending}
          onClick={() => startTransition(async () => { await setMatchFinished(matchId) })}
        >
          <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse inline-block" />
          EN DIRECT — Terminer
        </Button>
      </div>
    )
  }

  if (currentStatus === 'UPCOMING') {
    return (
      <Button
        size="sm"
        variant="outline"
        className="font-bold text-xs gap-1.5 h-8 border-red-200 text-red-700 hover:bg-red-50"
        disabled={isPending}
        onClick={() => startTransition(async () => { await setMatchLive(matchId) })}
      >
        <Radio className="w-3 h-3" /> Démarrer LIVE
      </Button>
    )
  }

  // FINISHED
  return (
    <Button
      size="sm"
      variant="ghost"
      className="font-bold text-xs gap-1.5 h-8 text-muted-foreground"
      disabled={isPending}
      onClick={() => startTransition(async () => { await setMatchUpcoming(matchId) })}
    >
      ↩ Réouvrir
    </Button>
  )
}

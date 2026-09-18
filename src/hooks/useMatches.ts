import { useCallback, useEffect, useState } from 'react'
import type { Match } from '../types'
import { createMatchDataProvider } from '../services/matches'

const provider = createMatchDataProvider()

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const next = await provider.getMatches()
      setMatches(next)
    } catch {
      setError('לא ניתן להציג את המשחקים כרגע.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return { matches, loading, error, refresh: load }
}

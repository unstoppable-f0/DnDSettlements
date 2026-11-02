import { useCallback, useEffect, useRef, useState } from 'react'
import { errorMessage } from '../api/client'

// Callers supply a stable loader (module function or useCallback).
export function useQuery<T>(loader: (signal: AbortSignal) => Promise<T>) {
  const [state, setState] = useState<{ data?: T; error?: string; loading: boolean }>({ loading: true })
  const controller = useRef<AbortController | null>(null)
  const reload = useCallback(async () => {
    controller.current?.abort()
    const current = new AbortController()
    controller.current = current
    setState(previous => ({ ...previous, error: undefined, loading: true }))
    try {
      const data = await loader(current.signal)
      if (!current.signal.aborted) setState({ data, loading: false })
    } catch (error) {
      if (!current.signal.aborted) setState(previous => ({ ...previous, error: errorMessage(error), loading: false }))
    }
  }, [loader])
  useEffect(() => {
    // The effect starts external I/O; reload also supports explicit user retries.
    // eslint-disable-next-line react/set-state-in-effect
    void reload()
    return () => controller.current?.abort()
  }, [reload])
  return { ...state, reload }
}

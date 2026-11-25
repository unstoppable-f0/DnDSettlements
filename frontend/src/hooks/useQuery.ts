import { useCallback, useEffect, useRef, useState } from 'react'
import { errorMessage } from '../api/client'

type Loader<T> = (signal: AbortSignal) => Promise<T>

interface QueryState<T> {
  source?: Loader<T>
  data?: T
  error?: string
  loading: boolean
  attempt: number
}

export function useQuery<T>(load: Loader<T>, enabled = true) {
  const [state, setState] = useState<QueryState<T>>({ loading: true, attempt: 0 })
  const request = useRef<AbortController | null>(null)
  const current = state.source === load
  const loading = !current || state.loading
  const { attempt } = state

  useEffect(() => {
    if (!enabled || !loading) return
    const controller = new AbortController()
    request.current = controller

    async function read() {
      try {
        const data = await load(controller.signal)
        if (!controller.signal.aborted) setState({ source: load, attempt, data, loading: false })
      } catch (cause) {
        if (!controller.signal.aborted) {
          setState(previous => ({
            source: load, attempt, loading: false, error: errorMessage(cause),
            data: previous.source === load ? previous.data : undefined,
          }))
        }
      }
    }

    void read()
    return () => controller.abort()
  }, [load, enabled, loading, attempt])

  function reload() {
    request.current?.abort()
    setState(previous => ({ ...previous, loading: true, error: undefined, attempt: previous.attempt + 1 }))
  }

  // A GET started before a confirmed write must not overwrite the write response.
  function update(apply: (current: T) => T) {
    request.current?.abort()
    setState(previous => previous.source === load && previous.data !== undefined
      ? { ...previous, data: apply(previous.data), loading: false, error: undefined }
      : { ...previous, loading: true, attempt: previous.attempt + 1 })
  }

  return { data: current ? state.data : undefined, error: current ? state.error : undefined, loading, reload, update }
}

export function useKeyedQuery<K, T>(load: (key: K, signal: AbortSignal) => Promise<T>, key: K, enabled = true) {
  const loader = useCallback((signal: AbortSignal) => load(key, signal), [load, key])
  return useQuery(loader, enabled)
}

import { useRef, useState } from 'react'
import { errorMessage } from '../api/client'

export function useMutation() {
  const running = useRef(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string>()

  async function run(action: () => Promise<void>) {
    if (running.current) return
    running.current = true
    setPending(true)
    setError(undefined)
    try {
      await action()
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      running.current = false
      setPending(false)
    }
  }
  return { run, pending, error }
}

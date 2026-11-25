import { getSettlement } from '../api/settlements.ts'

// Commands can outlive their route. Each entry lasts until its write settles.
const pending = new Map<number, Promise<unknown>>()

export async function runSettlementWrite(id: number, action: () => Promise<unknown>) {
  if (pending.has(id)) return false
  const write = Promise.resolve().then(action)
  pending.set(id, write)
  try {
    await write
    return true
  } finally {
    pending.delete(id)
  }
}

export async function openSettlement(id: string, signal: AbortSignal) {
  const settlement = await getSettlement(id, signal)
  const write = pending.get(settlement.id)
  // A returning screen needs fresh reads after either outcome of the previous write.
  if (write) await Promise.allSettled([write])
  signal.throwIfAborted()
  return settlement
}

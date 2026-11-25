import { request, requestList } from './client.ts'
import type { CreateEventResolution, EventResolution, SettlementEvent } from './models'

export function listActiveEvents(settlementId: number, signal: AbortSignal) {
  return requestList<SettlementEvent>(`/events/unresolved/${settlementId}`, {
    signal, emptyOn404: true,
  })
}

export function listResolutions(eventId: number, signal: AbortSignal) {
  return requestList<EventResolution>(`/event_resolutions/${eventId}`, { signal, emptyOn404: true })
}

export function createResolution(draft: CreateEventResolution) {
  return request<EventResolution>('/event_resolutions/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(draft),
  })
}

export function decideResolution(id: number) {
  return request<EventResolution>(`/event_resolutions/decide/${id}`, { method: 'PATCH' })
}

export async function loadEventHistory(settlementId: number, signal: AbortSignal) {
  const events = await requestList<SettlementEvent>(`/events/resolved/${settlementId}`, {
    signal, emptyOn404: true,
  })
  if (events.length === 0) return []

  const params = new URLSearchParams(events.map(event => ['event_ids', String(event.id)]))
  const chosen = await requestList<EventResolution>(`/event_resolutions/many_chosen/?${params}`, {
    signal, emptyOn404: true,
  })
  const byEvent = new Map(chosen.map(resolution => [resolution.event_id, resolution]))
  return events.map(event => ({ event, resolution: byEvent.get(event.id) }))
}

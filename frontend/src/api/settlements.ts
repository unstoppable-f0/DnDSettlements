import { request, requestList } from './client'
import type { Asset } from '../types/asset'
import type { Building } from '../types/building'
import type { Event } from '../types/event'
import type { Settlement } from '../types/settlement'
import type { CreateEventResolution, EventResolution } from '../types/eventResolution'

export type CoffersOperation = 'donation' | 'withdrawal'

export const settlementsApi = {
  get: (id: string, signal?: AbortSignal) => request<Settlement>(`/settlements/${id}`, { signal }),
  assets: (id: string, signal?: AbortSignal) => request<Asset>(`/assets/${id}`, { signal }),
  buildings: (id: string, signal?: AbortSignal) => requestList<Building>(`/buildings/settlements/${id}`, signal),
  events: (id: string, resolved: boolean, signal?: AbortSignal) =>
    requestList<Event>(`/events/${resolved ? 'resolved' : 'unresolved'}/${id}`, signal, true),
  resolutions: (id: number, signal?: AbortSignal) => requestList<EventResolution>(`/event_resolutions/${id}`, signal, true),
  chosenResolutions: (ids: number[], signal?: AbortSignal) => {
    if (ids.length === 0) return Promise.resolve<EventResolution[]>([])
    const params = new URLSearchParams(ids.map(id => ['event_ids', String(id)]))
    return requestList<EventResolution>(`/event_resolutions/many_chosen/?${params}`, signal)
  },
  build: (id: number) => request<Building>(`/buildings/build/${id}`, { method: 'PATCH' }),
  decide: (id: number) => request<EventResolution>(`/event_resolutions/decide/${id}`, { method: 'PATCH' }),
  createResolution: (data: CreateEventResolution) => request<EventResolution>('/event_resolutions/', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
  }),
  updateCoffers: (id: string, operation: CoffersOperation, gold: number) => {
    const parameter = operation === 'donation' ? 'donated_gold' : 'withdrawn_gold'
    return request<Asset>(`/assets/coffers_${operation}/${id}?${parameter}=${gold}`, { method: 'PATCH' })
  },
}

export async function loadSettlement(id: string, signal: AbortSignal) {
  const [settlement, assets, buildings, events, resolvedEvents] = await Promise.all([
    settlementsApi.get(id, signal), settlementsApi.assets(id, signal),
    settlementsApi.buildings(id, signal), settlementsApi.events(id, false, signal),
    settlementsApi.events(id, true, signal),
  ])
  const resolutions = await settlementsApi.chosenResolutions(resolvedEvents.map(event => event.id), signal)
  const byEvent = new Map(resolutions.map(resolution => [resolution.event_id, resolution]))
  const history = resolvedEvents.map(event => ({ event, resolution: byEvent.get(event.id) }))
  return { settlement, assets, buildings, events, history }
}

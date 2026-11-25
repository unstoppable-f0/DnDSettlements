import { request, requestList } from './client.ts'
import type { Assets, Building, Settlement } from './models'

export function getSettlement(id: string, signal: AbortSignal) {
  return request<Settlement>(`/settlements/${encodeURIComponent(id)}`, { signal })
}

export function getAssets(id: number, signal: AbortSignal) {
  return request<Assets>(`/assets/${id}`, { signal })
}

export type CoffersOperation = 'donation' | 'withdrawal'

export function updateCoffers(id: number, operation: CoffersOperation, gold: number) {
  const parameter = operation === 'donation' ? 'donated_gold' : 'withdrawn_gold'
  return request<Assets>(`/assets/coffers_${operation}/${id}?${parameter}=${gold}`, {
    method: 'PATCH',
  })
}

export function listBuildings(id: number, signal: AbortSignal) {
  return requestList<Building>(`/buildings/settlements/${id}`, { signal })
}

export function buildProject(id: number) {
  return request<Building>(`/buildings/build/${id}`, { method: 'PATCH' })
}

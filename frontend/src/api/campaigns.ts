import { request, requestList } from './client.ts'
import type { Campaign, Settlement } from './models'

export function listCampaigns(signal: AbortSignal) {
  return requestList<Campaign>('/campaigns/', { signal, emptyOn404: true })
}

export function getCampaign(id: string, signal: AbortSignal) {
  return request<Campaign>(`/campaigns/${encodeURIComponent(id)}`, { signal })
}

export function listCampaignSettlements(id: string | number, signal: AbortSignal) {
  return requestList<Settlement>(`/settlements/campaigns/${encodeURIComponent(id)}`, { signal })
}

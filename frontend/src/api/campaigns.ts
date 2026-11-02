import { request, requestList } from './client'
import type { Campaign } from '../types/campaign'
import type { Settlement } from '../types/settlement'

export const campaignsApi = {
  list: (signal?: AbortSignal) => requestList<Campaign>('/campaigns/', signal, true),
  get: (id: string, signal?: AbortSignal) => request<Campaign>(`/campaigns/${id}`, { signal }),
  settlements: (id: string, signal?: AbortSignal) => requestList<Settlement>(`/settlements/campaigns/${id}`, signal),
}

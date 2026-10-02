export interface EventResolution {
  id: number
  event_id: number
  name: string
  description: string
  chosen: boolean
  income: number
  coffers: number
  resources: number
  defence: number
}

export interface CreateEventResolution {
  event_id: number
  name: string
  description: string
  income: number
  coffers: number
  resources: number
  defence: number
}
export interface Campaign {
  id: number
  name: string
}

export interface Settlement {
  id: number
  name: string
  campaign: number
}

export interface Assets {
  income: number
  coffers: number
  resources: number
  defence: number
}

export interface Building extends Assets {
  id: number
  settlement_id: number
  name: string
  description: string
  is_built: boolean
}

export interface SettlementEvent {
  id: number
  settlement_id: number
  name: string
  description: string
  resolved: boolean
}

export interface CreateEventResolution extends Assets {
  event_id: number
  name: string
  description: string
}

export interface EventResolution extends CreateEventResolution {
  id: number
  chosen: boolean
}

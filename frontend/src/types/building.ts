export interface Building {
  id: number
  settlement_id: number
  name: string
  description: string
  is_built: boolean
  income: number
  coffers: number
  resources: number
  defence: number
}
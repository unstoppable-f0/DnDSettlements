import { Link } from 'react-router'
import type { Settlement } from '../types/settlement'

interface SettlementCardProps {
  settlement: Settlement
}

export default function SettlementCard({ settlement }: SettlementCardProps) {
  return <Link to={`/settlements/${settlement.id}`} className="campaign-card">
    <h3>{settlement.name}</h3>
    <span className="campaign-card-arrow" aria-hidden="true">↗</span>
  </Link>
}

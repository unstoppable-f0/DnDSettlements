import { Link } from 'react-router'

interface Settlement {
  id: number
  name: string
  campaign: string
}

interface SettlementCardProps {
  settlement: Settlement
}

function SettlementCard({ settlement }: SettlementCardProps) {
  return (
    <div>
      <h3>{settlement.name}</h3>

      <Link to={`/settlements/${settlement.id}`}>
        Войти в поселение
      </Link>
    </div>
  )
}

export default SettlementCard
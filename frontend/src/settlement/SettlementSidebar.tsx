import { NavLink } from 'react-router'
import { listCampaignSettlements } from '../api/campaigns'
import QueryStatus from '../components/QueryStatus'
import { useKeyedQuery } from '../hooks/useQuery'
import './SettlementSidebar.css'

export default function SettlementSidebar({ campaignId }: { campaignId: number }) {
  const settlements = useKeyedQuery(listCampaignSettlements, campaignId)

  return (
    <aside className="settlement-sidebar">
      <details className="settlement-sidebar-disclosure">
        <summary><span aria-hidden="true">☰</span> Поселения</summary>
        <nav aria-label="Поселения кампании">
          <h2>Поселения</h2>
          <QueryStatus {...settlements} />
          <ul>
            {settlements.data?.map(settlement => (
              <li key={settlement.id}>
                <NavLink to={`/settlements/${settlement.id}`} end
                  className={({ isActive }) => `settlement-nav-link${isActive ? ' is-active' : ''}`}>
                  {settlement.name}
                </NavLink>
              </li>
            ))}
          </ul>
          {settlements.data?.length === 0 && <p>Пока нет поселений.</p>}
        </nav>
      </details>
    </aside>
  )
}

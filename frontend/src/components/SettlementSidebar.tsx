import { useCallback } from 'react'
import { NavLink } from 'react-router'
import { campaignsApi } from '../api/campaigns'
import { useQuery } from '../hooks/useQuery'
import QueryStatus from './QueryStatus'
import './Navigation.css'

export default function SettlementSidebar({ campaignId }: { campaignId: number }) {
  const loader = useCallback((signal: AbortSignal) => campaignsApi.settlements(String(campaignId), signal), [campaignId])
  const query = useQuery(loader)

  return <aside className="settlement-sidebar">
    <details className="settlement-sidebar-disclosure">
      <summary><span aria-hidden="true">☰</span> Поселения</summary>
    <nav aria-label="Поселения кампании">
      <h2>Поселения</h2>
      <QueryStatus {...query} onRetry={query.reload} />
      <ul>
        {query.data?.map(settlement => <li key={settlement.id}>
          <NavLink to={`/settlements/${settlement.id}`} end
            className={({ isActive }) => `settlement-nav-link${isActive ? ' is-active' : ''}`}>
            {settlement.name}
          </NavLink>
        </li>)}
      </ul>
      {query.data?.length === 0 && <p>Пока нет поселений.</p>}
    </nav>
    </details>
  </aside>
}

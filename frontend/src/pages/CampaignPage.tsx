import { useCallback } from 'react'
import { useParams } from 'react-router'
import SettlementCard from '../components/SettlementCard'
import BackLink from '../components/BackLink'
import QueryStatus from '../components/QueryStatus'
import { campaignsApi } from '../api/campaigns'
import { useQuery } from '../hooks/useQuery'
import './CampaignsPage.css'

export default function CampaignPage() {
  const { campaignId } = useParams()
  return campaignId ? <CampaignDetails key={campaignId} id={campaignId} /> : null
}

function CampaignDetails({ id }: { id: string }) {
  const load = useCallback(async (signal: AbortSignal) => {
    const [campaign, settlements] = await Promise.all([
      campaignsApi.get(id, signal), campaignsApi.settlements(id, signal),
    ])
    return { campaign, settlements }
  }, [id])
  const query = useQuery(load)
  return <main className="campaigns-page">
    <BackLink to="/campaigns" label="Кампании" />
    <div className="campaigns-status"><QueryStatus {...query} onRetry={query.reload} /></div>
    {query.data && <>
      <header className="campaigns-heading">
        <h1>{query.data.campaign.name}</h1>
      </header>
      <section aria-labelledby="settlements-heading">
        <div className="campaigns-section-heading">
          <h2 id="settlements-heading">Поселения</h2>
          <span className="campaigns-count" aria-label={`Всего поселений: ${query.data.settlements.length}`}>
            {query.data.settlements.length}
          </span>
        </div>
        <div className="campaigns-grid">
          {query.data.settlements.map(settlement => <SettlementCard key={settlement.id} settlement={settlement} />)}
        </div>
        {query.data.settlements.length === 0 && <p className="campaigns-empty">Пока нет поселений.</p>}
      </section>
    </>}
  </main>
}

import CampaignCard from '../components/CampaignCard'
import QueryStatus from '../components/QueryStatus'
import { campaignsApi } from '../api/campaigns'
import { useQuery } from '../hooks/useQuery'
import './CampaignsPage.css'

export default function CampaignsPage() {
  const query = useQuery(campaignsApi.list)

  return <main className="campaigns-page">
    <header className="campaigns-heading">
      <h1>Кампании</h1>
      {query.data && <span className="campaigns-count" aria-label={`Всего кампаний: ${query.data.length}`}>
        {query.data.length}
      </span>}
    </header>
    <div className="campaigns-status"><QueryStatus {...query} onRetry={query.reload} /></div>
    <div className="campaigns-grid">
      {query.data?.map(campaign => <CampaignCard key={campaign.id} campaign={campaign} />)}
    </div>
    {query.data?.length === 0 && <p className="campaigns-empty">Пока нет кампаний.</p>}
  </main>
}

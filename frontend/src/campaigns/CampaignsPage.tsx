import { listCampaigns } from '../api/campaigns'
import QueryStatus from '../components/QueryStatus'
import { useQuery } from '../hooks/useQuery'
import DirectoryCard from './DirectoryCard'
import './CampaignsPage.css'

export default function CampaignsPage() {
  const campaigns = useQuery(listCampaigns)

  return (
    <main className="campaigns-page">
      <header className="campaigns-heading">
        <h1>Кампании</h1>
        {campaigns.data && (
          <span className="campaigns-count" aria-label={`Всего кампаний: ${campaigns.data.length}`}>
            {campaigns.data.length}
          </span>
        )}
      </header>
      <div className="campaigns-status"><QueryStatus {...campaigns} /></div>
      <div className="campaigns-grid">
        {campaigns.data?.map(campaign => (
          <DirectoryCard key={campaign.id} to={`/campaigns/${campaign.id}`} name={campaign.name} heading="h2" />
        ))}
      </div>
      {campaigns.data?.length === 0 && <p className="campaigns-empty">Пока нет кампаний.</p>}
    </main>
  )
}

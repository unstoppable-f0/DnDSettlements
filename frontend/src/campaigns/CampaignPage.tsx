import { useParams } from 'react-router'
import { getCampaign, listCampaignSettlements } from '../api/campaigns'
import BackLink from '../components/BackLink'
import QueryStatus from '../components/QueryStatus'
import { useKeyedQuery } from '../hooks/useQuery'
import DirectoryCard from './DirectoryCard'
import './CampaignsPage.css'

export default function CampaignPage() {
  const { campaignId } = useParams()
  return campaignId ? <CampaignDetails key={campaignId} id={campaignId} /> : null
}

function CampaignDetails({ id }: { id: string }) {
  const campaign = useKeyedQuery(getCampaign, id)
  const settlements = useKeyedQuery(listCampaignSettlements, id)

  return (
    <main className="campaigns-page">
      <BackLink to="/campaigns" label="Кампании" />
      <div className="campaigns-status"><QueryStatus {...campaign} /></div>
      {campaign.data && (
        <>
          <header className="campaigns-heading"><h1>{campaign.data.name}</h1></header>
          <section aria-labelledby="settlements-heading">
            <div className="campaigns-section-heading">
              <h2 id="settlements-heading">Поселения</h2>
              {settlements.data && (
                <span className="campaigns-count" aria-label={`Всего поселений: ${settlements.data.length}`}>
                  {settlements.data.length}
                </span>
              )}
            </div>
            <div className="campaigns-status"><QueryStatus {...settlements} /></div>
            <div className="campaigns-grid">
              {settlements.data?.map(settlement => (
                <DirectoryCard key={settlement.id} to={`/settlements/${settlement.id}`} name={settlement.name} heading="h3" />
              ))}
            </div>
            {settlements.data?.length === 0 && <p className="campaigns-empty">Пока нет поселений.</p>}
          </section>
        </>
      )}
    </main>
  )
}

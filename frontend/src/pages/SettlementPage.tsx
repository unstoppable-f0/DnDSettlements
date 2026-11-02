import { useCallback, useState } from 'react'
import { useParams } from 'react-router'
import EventCard from '../components/EventCard'
import BackLink from '../components/BackLink'
import SettlementSidebar from '../components/SettlementSidebar'
import ResolvedEventCard from '../components/ResolvedEventCard'
import BuildingCard from '../components/BuildingCard'
import AssetPanel from '../components/AssetPanel'
import QueryStatus from '../components/QueryStatus'
import { loadSettlement } from '../api/settlements'
import { useQuery } from '../hooks/useQuery'
import './SettlementPage.css'

const tabs = [
  { id: 'events', label: 'События' },
  { id: 'buildings', label: 'Проекты строительства' },
  { id: 'resolved-events', label: 'История событий' },
] as const

export default function SettlementPage() {
  const { settlementId } = useParams()
  return settlementId ? <SettlementDetails key={settlementId} id={settlementId} /> : null
}

function SettlementDetails({ id }: { id: string }) {
  const [activeTab, setActiveTab] = useState<typeof tabs[number]['id']>('events')
  const loader = useCallback((signal: AbortSignal) => loadSettlement(id, signal), [id])
  const query = useQuery(loader)
  const data = query.data

  return <>
    {data && <SettlementSidebar key={data.settlement.campaign} campaignId={data.settlement.campaign} />}
    <main className="settlement-page">
    <div className="settlement-back-navigation">
      <BackLink to="/campaigns" label="К кампаниям" />
    </div>
    <QueryStatus {...query} onRetry={query.reload} />
    {data && <>
      <header className="settlement-header">
        <h1>{data.settlement.name}</h1>
        <AssetPanel assets={data.assets} settlementId={id} onAssetsUpdated={query.reload} />
      </header>
      <nav className="settlement-tabs" aria-label="Разделы поселения">
        {tabs.map(tab => <button key={tab.id} className={activeTab === tab.id ? 'active' : ''}
          aria-pressed={activeTab === tab.id} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>)}
      </nav>
      <section className="settlement-content">
        <h2>{tabs.find(tab => tab.id === activeTab)?.label}</h2>
        {activeTab === 'events' && <>
          {data.events.map(event => <EventCard key={event.id} event={event} onResolved={query.reload} />)}
          {data.events.length === 0 && <p>Пока нет событий.</p>}
        </>}
        {activeTab === 'buildings' && <>
          {data.buildings.map(building => <BuildingCard key={building.id} building={building} onBuilt={query.reload} />)}
          {data.buildings.length === 0 && <p>Пока нет проектов строительства.</p>}
        </>}
        {activeTab === 'resolved-events' && <>
          {data.history.map(({ event, resolution }) => resolution
            ? <ResolvedEventCard key={event.id} event={event} resolution={resolution} />
            : <p key={event.id}>{event.name}: принятое решение не найдено.</p>)}
          {data.history.length === 0 && <p>Пока нет разрешённых событий.</p>}
        </>}
      </section>
    </>}
  </main>
  </>
}

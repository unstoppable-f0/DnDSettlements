import { useState, type ComponentProps, type ReactNode } from 'react'
import { useParams } from 'react-router'
import type { Settlement } from '../api/models'
import BackLink from '../components/BackLink'
import QueryStatus from '../components/QueryStatus'
import { useKeyedQuery } from '../hooks/useQuery'
import AssetPanel from './assets/AssetPanel'
import BuildingCard from './buildings/BuildingCard'
import EventCard from './events/EventCard'
import ResolvedEventCard from './events/ResolvedEventCard'
import SettlementSidebar from './SettlementSidebar'
import { openSettlement } from './settlementWrites'
import { useSettlement, type SettlementTab } from './useSettlement'
import './SettlementPage.css'

const labels = {
  events: 'События',
  buildings: 'Проекты строительства',
  history: 'История событий',
} satisfies Record<SettlementTab, string>

interface SectionProps<T> {
  tab: SettlementTab
  active: SettlementTab
  query: ComponentProps<typeof QueryStatus> & { data?: T[] }
  empty: string
  children: (item: T) => ReactNode
}

function SettlementSection<T>({ tab, active, query, empty, children }: SectionProps<T>) {
  return (
    <section className="settlement-content" hidden={tab !== active} aria-label={labels[tab]}>
      <h2>{labels[tab]}</h2>
      <QueryStatus {...query} />
      {query.data?.map(children)}
      {query.data?.length === 0 && <p>{empty}</p>}
    </section>
  )
}

export default function SettlementPage() {
  const { settlementId } = useParams()
  return settlementId ? <SettlementDetails key={settlementId} id={settlementId} /> : null
}

function SettlementDetails({ id }: { id: string }) {
  const settlement = useKeyedQuery(openSettlement, id)
  return (
    <>
      <div className="settlement-navigation">
        {settlement.data && <SettlementSidebar campaignId={settlement.data.campaign} />}
        <BackLink to="/campaigns" label="К кампаниям" />
      </div>
      <main className="settlement-page">
        <QueryStatus {...settlement} />
        {settlement.data && <SettlementWorkspace settlement={settlement.data} />}
      </main>
    </>
  )
}

function SettlementWorkspace({ settlement }: { settlement: Settlement }) {
  const [tab, setTab] = useState<SettlementTab>('events')
  const { assets, events, buildings, history, transfer, build, decide, create, pending, error } =
    useSettlement(settlement.id, tab)

  return (
    <>
      <header className="settlement-header">
        <h1>{settlement.name}</h1>
        <QueryStatus {...assets} />
        {assets.data && (
          <AssetPanel
            assets={assets.data}
            disabled={pending}
            incomeStale={assets.loading || !!assets.error}
            onTransfer={transfer}
          />
        )}
      </header>
      {pending && <p role="status">Сохранение...</p>}
      {error && <p role="alert">{error}</p>}
      <nav className="settlement-tabs" aria-label="Разделы поселения">
        {(['events', 'buildings', 'history'] as const).map(id => (
          <button type="button" key={id} aria-pressed={tab === id} onClick={() => setTab(id)}>
            {labels[id]}
          </button>
        ))}
      </nav>
      <SettlementSection tab="events" active={tab} query={events} empty="Пока нет событий.">
        {event => (
          <EventCard
            key={event.id}
            event={event}
            disabled={pending || events.loading || !!events.error}
            onDecide={decide}
            onCreate={create}
          />
        )}
      </SettlementSection>
      <SettlementSection tab="buildings" active={tab} query={buildings} empty="Пока нет проектов строительства.">
        {building => (
          <BuildingCard
            key={building.id}
            building={building}
            disabled={pending || buildings.loading || !!buildings.error}
            onBuild={build}
          />
        )}
      </SettlementSection>
      <SettlementSection tab="history" active={tab} query={history} empty="Пока нет разрешённых событий.">
        {entry => <ResolvedEventCard key={entry.event.id} {...entry} />}
      </SettlementSection>
    </>
  )
}

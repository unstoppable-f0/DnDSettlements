import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import EventCard from '../components/EventCard'
import ResolvedEventCard from "../components/ResolvedEventCard.tsx";
import BuildingCard from '../components/BuildingCard'
import AssetPanel from "../components/AssetPanel.tsx";

import type { Event } from '../types/event'
import type { Building } from '../types/building'
import type { Asset } from '../types/asset.ts'
import type { Settlement} from "../types/settlement.ts"
import type { EventResolution } from "../types/eventResolution.ts";


function SettlementPage() {
  const { settlementId } = useParams()
  const [activeTab, setActiveTab] = useState<'events' | 'buildings' | 'resolved-events'>('events')

  const [assets, setAssets] = useState<Asset | null>(null)
  const [events, setEvents] = useState<Event[]>([])

  const [resolvedEvents, setResolvedEvents] = useState<Event[]>([])
  const [chosenResolutions, setChosenResolutions] = useState<EventResolution[]>([])

  const [buildings, setBuildings] = useState<Building[]>([])
  const [settlement, setSettlement] = useState<Settlement | null>(null)

  async function fetchList<T>(url: string): Promise<T[]> {
      try {
        const response = await fetch(url)
        if (!response.ok) return []
        const data = await response.json()
        return Array.isArray(data) ? data : []
      } catch {
        return []
      }
    }

  function loadAssets() {
      fetch(`/api/assets/${settlementId}`)
        .then(response => response.json())
        .then(data => setAssets(data))
    }

  useEffect(() => {
    loadAssets()
  }, [settlementId])

    function loadEvents() {
      fetchList<Event>(`/api/events/unresolved/${settlementId}`).then(setEvents)
    }

  useEffect(() => {
      loadEvents()
  }, [settlementId])

    function loadResolvedEvents() {
      fetchList<Event>(`/api/events/resolved/${settlementId}`).then(setResolvedEvents)
    }

    useEffect(() => {
        loadResolvedEvents()
    }, [settlementId]);


function loadChosenResolutions() {
  if (resolvedEvents.length === 0) {
    setChosenResolutions([])
    return
  }

  const params = new URLSearchParams()
  resolvedEvents.forEach(event => params.append('event_ids', String(event.id)))

  fetchList<EventResolution>(
    `/api/event_resolutions/many_chosen/?${params.toString()}`
  ).then(setChosenResolutions)
}

  useEffect(() => {
      loadChosenResolutions()
    }, [resolvedEvents])

function loadBuildings() {
  fetchList<Building>(`/api/buildings/settlements/${settlementId}`).then(setBuildings)
}

  useEffect(() => {
      loadBuildings()
    }, [settlementId])

  function loadSettlement() {
      fetch(`/api/settlements/${settlementId}`)
      .then(response => response.json())
      .then(data => setSettlement(data))
  }

  useEffect(() => {
      loadSettlement()
  }, [settlementId])

  if (!assets || !settlement) {
    return <p>Загрузка поселения...</p>
  }

  return (
      <main className="settlement-page">
        <header className="settlement-header">
          <h1>{settlement.name}</h1>

          <AssetPanel assets={assets} />
        </header>

        <nav className="settlement-tabs">
          <button
            className={activeTab === 'events' ? 'active' : ''}
            onClick={() => setActiveTab('events')}
          >
            События
          </button>

          <button
            className={activeTab === 'buildings' ? 'active' : ''}
            onClick={() => setActiveTab('buildings')}
          >
            Проекты строительства
          </button>

          <button
            className={activeTab === 'resolved-events' ? 'active' : ''}
            onClick={() => setActiveTab('resolved-events')}
          >
            История событий
          </button>
        </nav>

        {activeTab === 'events' && (
          <section className="settlement-content">
            <h2>События</h2>

            {events.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onResolved={() => {
                  loadAssets()
                  loadEvents()
                  loadResolvedEvents()
                }}
              />
            ))}
          </section>
        )}

        {activeTab === 'buildings' && (
          <section className="settlement-content">
            <h2>Проекты строительства</h2>

            {buildings.map(building => (
              <BuildingCard
                key={building.id}
                building={building}
                onBuilt={() => {
                  loadBuildings()
                  loadAssets()
                }}
              />
            ))}
          </section>
        )}

    {activeTab === 'resolved-events' && (
      <section className="settlement-content">
        <h2>История событий</h2>

        {(() => {
          const items = resolvedEvents
            .map(event => ({
              event,
              resolution: chosenResolutions.find(r => r.event_id === event.id),
            }))
            .filter(item => item.resolution)

          if (items.length === 0) {
            return <p>Пока нет разрешённых событий.</p>
          }

          return items.map(({ event, resolution }) => (
            <ResolvedEventCard
              key={event.id}
              event={event}
              resolution={resolution!}
            />
          ))
        })()}
      </section>
    )}
      </main>
    )
}

export default SettlementPage
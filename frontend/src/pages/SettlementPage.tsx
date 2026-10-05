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


  function loadAssets() {
      fetch(`http://localhost:8000/assets/${settlementId}`)
        .then(response => response.json())
        .then(data => setAssets(data))
    }

  useEffect(() => {
    loadAssets()
  }, [settlementId])

  function loadEvents() {
      fetch(`http://localhost:8000/events/unresolved/${settlementId}`)
      .then(response => response.json())
      .then(data => setEvents(data))
  }

  useEffect(() => {
      loadEvents()
  }, [settlementId])

  function loadResolvedEvents() {
      fetch(`http://localhost:8000/events/resolved/${settlementId}`)
          .then(response => response.json())
          .then(data => setResolvedEvents(data))
    }

    useEffect(() => {
        loadResolvedEvents()
    }, [settlementId]);


  function loadChosenResolutions() {
      const eventIds = resolvedEvents.map(event => event.id)

      if (eventIds.length === 0) {
        setChosenResolutions([])
        return
      }

      const params = new URLSearchParams()

      eventIds.forEach(id => {
        params.append('event_ids', String(id))
      })

      fetch(
        `http://localhost:8000/event_resolutions/many_chosen/?${params.toString()}`
      )
        .then(response => response.json())
        .then(data => setChosenResolutions(data))
    }

  useEffect(() => {
      loadChosenResolutions()
    }, [resolvedEvents])

  function loadBuildings() {
      fetch(`http://localhost:8000/buildings/settlements/${settlementId}`)
        .then(response => response.json())
        .then(data => setBuildings(data))
  }

  useEffect(() => {
      loadBuildings()
    }, [settlementId])

  function loadSettlement() {
      fetch(`http://localhost:8000/settlements/${settlementId}`)
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
        <h2>Resolved Events</h2>

        {resolvedEvents.length === 0 ? (
          <p>No resolved events yet.</p>
        ) : (
          resolvedEvents.map(event => {
            const resolution = chosenResolutions.find(
              resolution => resolution.event_id === event.id
            )

            if (!resolution) {
              return null
            }

            return (
              <ResolvedEventCard
                key={event.id}
                event={event}
                resolution={resolution}
              />
            )
          })
        )}
      </section>
    )}
      </main>
    )
}

export default SettlementPage
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import EventCard from '../components/EventCard'
import BuildingCard from '../components/BuildingCard'
import AssetPanel from "../components/AssetPanel.tsx";

import type { Event } from '../types/event'
import type { Building } from '../types/building'
import type { Asset } from '../types/asset.ts'


function SettlementPage() {
  const { settlementId } = useParams()
  const [activeTab, setActiveTab] = useState<'events' | 'buildings'>('events')

  const [assets, setAssets] = useState<Asset | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [buildings, setBuildings] = useState<Building[]>([])


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


  function loadBuildings() {
      fetch(`http://localhost:8000/buildings/settlements/${settlementId}`)
        .then(response => response.json())
        .then(data => setBuildings(data))
  }

  useEffect(() => {
      loadBuildings()
    }, [settlementId])

  if (!assets) {
    return <p>Загрузка поселения...</p>
  }

  return (
    <main>
      <h1>Поселение</h1>

      <AssetPanel assets={assets} />


    <div>
      <button onClick={() => setActiveTab('events')}>
        Events
      </button>

      <button onClick={() => setActiveTab('buildings')}>
        Buildings
      </button>
    </div>

    {activeTab === 'events' && (
      <section>
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
      <section>
        <h2>Buildings</h2>

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

    </main>
  )
}

export default SettlementPage
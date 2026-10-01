import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import EventCard from '../components/EventCard'
import type { Event } from '../types/event'

interface Asset {
  income: number
  coffers: number
  resources: number
  defence: number
}


function SettlementPage() {
  const { settlementId } = useParams()

  const [assets, setAssets] = useState<Asset | null>(null)
  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {
    fetch(`http://localhost:8000/assets/${settlementId}`)
      .then(response => response.json())
      .then(data => setAssets(data))
  }, [settlementId])

  useEffect(() => {
  fetch(`http://localhost:8000/events/unresolved/${settlementId}`)
    .then(response => response.json())
    .then(data => setEvents(data))
  }, [settlementId])

  if (!assets) {
    return <p>Загрузка поселения...</p>
  }

  return (
    <main>
      <h1>Поселение</h1>

      <p>Доход: {assets.income}</p>
      <p>Казна: {assets.coffers}</p>
      <p>Ресурсы: {assets.resources}</p>
      <p>Обороноспособность: {assets.defence}</p>


      <h2>События</h2>

    {events.map(event => (
      <EventCard
        key={event.id}
        event={event}
      />
    ))}

    </main>
  )
}

export default SettlementPage
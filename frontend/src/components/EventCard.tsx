import type { Event } from '../types/event'

interface EventCardProps {
  event: Event
}

function EventCard({ event }: EventCardProps) {
  return (
    <div>
      <h3>{event.name}</h3>
      <p>{event.description}</p>
    </div>
  )
}

export default EventCard
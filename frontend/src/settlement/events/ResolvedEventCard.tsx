import type { EventResolution, SettlementEvent } from '../../api/models'
import AssetChanges from '../assets/AssetChanges'

interface Props {
  event: SettlementEvent
  resolution?: EventResolution
}

export default function ResolvedEventCard({ event, resolution }: Props) {
  return (
    <article className="settlement-card">
      <header>
        <h3>{event.name}</h3>
        <p>{event.description}</p>
      </header>
      {resolution ? (
        <div className="event-resolution">
          <h4>Принятое решение</h4>
          <h5>{resolution.name}</h5>
          <p>{resolution.description}</p>
          <AssetChanges values={resolution} />
        </div>
      ) : <p>Принятое решение не найдено.</p>}
    </article>
  )
}

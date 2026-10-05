import type { Event } from '../types/event'
import type {EventResolution} from "../types/eventResolution.ts";
import AssetChange from "./AssetChange.tsx";

interface ResolvedEventCardProps {
  event: Event
  resolution: EventResolution
}

function ResolvedEventCard({
  event,
  resolution,
}: ResolvedEventCardProps) {
  return (
    <div className="event-card">
      <div className="event-header">
        <h3>{event.name}</h3>
        <p>{event.description}</p>
      </div>

      <div className="event-resolution">
        <h4>Chosen resolution</h4>

        <h5>{resolution.name}</h5>
        <p>{resolution.description}</p>

        <div className="resolution-assets">
          <AssetChange label="Income" value={resolution.income} />
          <AssetChange label="Coffers" value={resolution.coffers} />
          <AssetChange label="Resources" value={resolution.resources} />
          <AssetChange label="Defence" value={resolution.defence} />
        </div>
      </div>
    </div>
  )
}

export default ResolvedEventCard
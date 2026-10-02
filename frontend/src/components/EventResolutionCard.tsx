import type { EventResolution } from '../types/eventResolution'
import AssetChange from './AssetChange'

interface EventResolutionCardProps {
  resolution: EventResolution
  onChoose: (resolution: EventResolution) => void
}

function EventResolutionCard({
  resolution,
  onChoose,
}: EventResolutionCardProps) {
  return (
    <div className="resolution-card">
      <h4>{resolution.name}</h4>
      <h5>{resolution.description}</h5>

        <div className="resolution-assets">
          <AssetChange
            label="Доход: "
            value={resolution.income}
          />

          <AssetChange
            label="Казна: "
            value={resolution.coffers}
          />

          <AssetChange
            label="Ресурсы: "
            value={resolution.resources}
          />

          <AssetChange
            label="Обороноспособность: "
            value={resolution.defence}
          />
        </div>

      <button onClick={() => onChoose(resolution)}>
        Choose
      </button>
    </div>
  )
}

export default EventResolutionCard
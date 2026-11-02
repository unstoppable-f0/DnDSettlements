import type { EventResolution } from '../types/eventResolution'
import AssetChange from './AssetChange'

interface EventResolutionCardProps {
  disabled?: boolean
  resolution: EventResolution
  onChoose: (resolution: EventResolution) => void
}

function EventResolutionCard({
  disabled = false,
  resolution,
  onChoose,
}: EventResolutionCardProps) {
  return (
    <div className="resolution-card">
      <h4>{resolution.name}</h4>
      <p>{resolution.description}</p>

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

      <button disabled={disabled} onClick={() => onChoose(resolution)}>
        Выбрать
      </button>
    </div>
  )
}

export default EventResolutionCard
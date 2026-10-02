import type { EventResolution } from '../types/eventResolution'

interface EventResolutionCardProps {
  resolution: EventResolution
  onChoose: (resolution: EventResolution) => void
}

function EventResolutionCard({
  resolution,
  onChoose,
}: EventResolutionCardProps) {
  return (
    <div>
      <h4>{resolution.name}</h4>
      <h5>{resolution.description}</h5>

      <p>Изменение дохода: {resolution.income}</p>
      <p>Изменение казны: {resolution.coffers}</p>
      <p>Изменение ресурсов: {resolution.resources}</p>
      <p>Изменение обороноспособности: {resolution.defence}</p>

      <button onClick={() => onChoose(resolution)}>
        Choose
      </button>
    </div>
  )
}

export default EventResolutionCard
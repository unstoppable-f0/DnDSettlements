import type { Building } from '../../api/models'
import AssetChanges from '../assets/AssetChanges'

interface Props {
  building: Building
  disabled: boolean
  onBuild: (id: number) => void
}

export default function BuildingCard({ building, disabled, onBuild }: Props) {
  return (
    <article className="settlement-card">
      <header>
        <h3>{building.name}</h3>
        <p>{building.description}</p>
      </header>
      <AssetChanges values={building} />
      {building.is_built ? (
        <p className="building-status">Проект завершён</p>
      ) : (
        <button type="button" disabled={disabled} onClick={() => onBuild(building.id)}>Построить</button>
      )}
    </article>
  )
}

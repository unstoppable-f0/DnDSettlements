import { useState } from 'react'
import { useMutation } from '../hooks/useMutation'
import { settlementsApi } from '../api/settlements'
import type { Building } from '../types/building'
import AssetChange from "./AssetChange.tsx";

interface BuildingCardProps {
  building: Building
  onBuilt: () => void | Promise<void>
}

function BuildingCard({
  building,
  onBuilt,
}: BuildingCardProps) {
    const [completed, setCompleted] = useState(false)
    const mutation = useMutation()
    const { pending: isBuilding, error } = mutation

    function handleBuild() {
      void mutation.run(async () => {
        await settlementsApi.build(building.id)
        setCompleted(true)
        await onBuilt()
      })
    }

    return (
        <div className="building-card">
            <div className="building-header">
                <h3>{building.name}</h3>
                <p>{building.description}</p>
            </div>

            <div className="building-assets">
                <AssetChange label="Доход" value={building.income}/>
                <AssetChange label="Казна" value={building.coffers}/>
                <AssetChange label="Ресурсы" value={building.resources}/>
                <AssetChange label="Обороноспособность" value={building.defence}/>
            </div>

            {building.is_built || completed ? (
                <p className="building-status">Проект завершён</p>
            ) : (
                <div className="building-actions">
                    <button onClick={handleBuild} disabled={isBuilding}>
                        {isBuilding ? 'Строительство...' : 'Построить'}
                    </button>

                    {error && <p role="alert">{error}</p>}
                </div>
            )}
        </div>
    )
}
export default BuildingCard
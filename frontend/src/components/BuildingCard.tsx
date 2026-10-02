import { useState } from "react";
import type { Building } from '../types/building'
import AssetChange from "./AssetChange.tsx";

interface BuildingCardProps {
  building: Building
  onBuilt: () => void
}

function BuildingCard({
  building,
  onBuilt,
}: BuildingCardProps) {
    const [isBuilding, setIsBuilding] = useState(false)
    const [error, setError] = useState<string | null>(null)


    async function handleBuild() {
        setIsBuilding(true)
        setError(null)

        try {
            const response = await fetch(
                `http://localhost:8000/buildings/build/${building.id}`,
                {
                    method: 'PATCH',
                },
            )

            if (!response.ok) {
                throw new Error('Failed to build building')
            }

            onBuilt()
        } catch {
            setError('Could not build this building. Please try again.')
        } finally {
            setIsBuilding(false)
        }
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

            {building.is_built ? (
                <p className="building-status">Built</p>
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
import { useState } from "react";
import type { Building } from '../types/building'

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
    <div>
      <h3>{building.name}</h3>
      <p>{building.description}</p>

      <p>Доход: {building.income}</p>
      <p>Казна: {building.coffers}</p>
      <p>Ресурсы: {building.resources}</p>
      <p>Обороноспособность: {building.defence}</p>

      {building.is_built ? (
        <p style={{color: 'green', fontWeight: 'bold'}}>Здание построено</p>
      ) : (
        <button
            onClick={handleBuild}
            disabled={isBuilding}
        >
            {isBuilding ? 'Строительство...' : 'Построить'}
        </button>
      )}

      {error && <p role="alert">{error}</p>}
    </div>

  )
}

export default BuildingCard
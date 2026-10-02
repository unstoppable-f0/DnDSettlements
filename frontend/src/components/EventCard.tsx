import { useState } from 'react'
import type { Event } from '../types/event'
import type { EventResolution, CreateEventResolution } from '../types/eventResolution'
import EventResolutionCard from './EventResolutionCard'

interface EventCardProps {
  event: Event
}

interface EventCardProps {
  event: Event
  onResolved: () => void
}

function EventCard({ event, onResolved }: EventCardProps) {
  const [resolutions, setResolutions] = useState<EventResolution[]>([])
  const [showResolutions, setShowResolutions] = useState(false)

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [income, setIncome] = useState(0)
  const [coffers, setCoffers] = useState(0)
  const [resources, setResources] = useState(0)
  const [defence, setDefence] = useState(0)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const [chosenResolution, setChosenResolution] = useState<EventResolution | null>(null)

  const [error, setError] = useState<string | null>(null)

  function handleShowResolutions() {
    setShowResolutions(true)

    fetch(`http://localhost:8000/event_resolutions/${event.id}`)
      .then(response => response.json())
      .then(data => setResolutions(data))
  }

  function resetCreateForm() {
  setName('')
  setDescription('')
  setIncome(0)
  setCoffers(0)
  setResources(0)
  setDefence(0)
}

  async function handleChooseResolution(resolution: EventResolution) {
    setError(null)

    try {
      const response = await fetch(
          `http://localhost:8000/event_resolutions/decide/${resolution.id}`,
          {
            method: 'PATCH',
          },
      )

      if (!response.ok) {
        throw new Error('Failed to decide event resolution')
      }


      setChosenResolution(resolution)
      onResolved()
    } catch {
      setError('Could not apply this resolution. Please try again.')
    }
  }

  async function handleCreateResolution() {
    const newResolution: CreateEventResolution = {
      event_id: event.id,
      name,
      description,
      income,
      coffers,
      resources,
      defence,
    }

    try {
      const response = await fetch(
        'http://localhost:8000/event_resolutions/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newResolution),
        },
      )

      if (!response.ok) {
        throw new Error('Failed to create resolution')
      }

      const createdResolution: EventResolution = await response.json()

      setResolutions(current => [
        ...current,
        createdResolution,
      ])

      setShowCreateForm(false)
      resetCreateForm()
    } catch {
      setError('Could not create resolution. Please try again.')
    }
  }


  return (
    <div>
      <h3>{event.name}</h3>
      <p>{event.description}</p>

      {!showResolutions && (
        <button onClick={handleShowResolutions}>
          Show resolutions
        </button>
      )}

      {showResolutions && (
        <div>
          {resolutions.map(resolution => (
            <EventResolutionCard
              key={resolution.id}
              resolution={resolution}
              onChoose={handleChooseResolution}
            />
          ))}

          <button onClick={() => setShowCreateForm(true)}>
            Вынести собственное решение
          </button>
        </div>
      )}

      {error && <p role="alert">{error}</p>}

      {showCreateForm && (
          <div>
            <h4>Собственный вердикт</h4>
            <label>
              Название:
              <input
                value={name}
                onChange={event => setName(event.target.value)}
              />
            </label>

            <label>
              Описание:
              <textarea
                value={description}
                onChange={event => setDescription(event.target.value)}
              />
            </label>
            <label>
              Доход:
              <input
                type="number"
                value={income}
                onChange={event => setIncome(Number(event.target.value))}
              />
            </label>

            <label>
              Казна:
              <input
                type="number"
                value={coffers}
                onChange={event => setCoffers(Number(event.target.value))}
              />
            </label>

            <label>
              Рерурсы:
              <input
                type="number"
                value={resources}
                onChange={event => setResources(Number(event.target.value))}
              />
            </label>

            <label>
              Обороноспособность:
              <input
                type="number"
                value={defence}
                onChange={event => setDefence(Number(event.target.value))}
              />
            </label>

            <button type="button" onClick={handleCreateResolution}>
              Вынести вердикт
            </button>
          </div>
      )}

      {chosenResolution && (
        <p style={{color: 'green', fontWeight: 'bold'}}>
          Выбрано: {chosenResolution.name}
        </p>
      )}
    </div>
  )
}

export default EventCard
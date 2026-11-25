import { useState } from 'react'
import { listResolutions } from '../../api/events'
import type { CreateEventResolution } from '../../api/models'
import QueryStatus from '../../components/QueryStatus'
import { useKeyedQuery } from '../../hooks/useQuery'
import AssetChanges from '../assets/AssetChanges'
import CreateResolutionForm from './CreateResolutionForm'
import './Events.css'

interface Props {
  eventId: number
  disabled: boolean
  onDecide: (id: number) => void
  onCreate: (draft: CreateEventResolution) => Promise<boolean>
  onCollapse: () => void
}

export default function EventResolutions({ eventId, disabled, onDecide, onCreate, onCollapse }: Props) {
  const resolutions = useKeyedQuery(listResolutions, eventId)
  const [editing, setEditing] = useState(false)

  async function submit(draft: CreateEventResolution) {
    if (await onCreate(draft)) setEditing(false)
    resolutions.reload()
  }

  return (
    <div className="event-resolutions">
      <div className="event-resolutions-heading">
        <h4>Вердикты:</h4>
        <button type="button" className="secondary-button" onClick={onCollapse}>Скрыть варианты</button>
      </div>
      <QueryStatus {...resolutions} />
      {resolutions.data?.map(resolution => (
        <div className="resolution-card" key={resolution.id}>
          <h4>{resolution.name}</h4>
          <p>{resolution.description}</p>
          <AssetChanges values={resolution} />
          <button type="button" disabled={disabled} onClick={() => onDecide(resolution.id)}>Выбрать</button>
        </div>
      ))}
      {resolutions.data?.length === 0 && <p>Пока нет вердиктов. Создайте свой вариант.</p>}
      {editing ? (
        <CreateResolutionForm eventId={eventId} pending={disabled} onSubmit={submit} onCancel={() => setEditing(false)} />
      ) : (
        <button type="button" className="secondary-button" disabled={disabled || resolutions.loading}
          onClick={() => setEditing(true)}>Выбрать свой вариант</button>
      )}
    </div>
  )
}

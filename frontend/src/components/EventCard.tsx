import { useCallback, useId, useRef, useState } from 'react'
import type { Event } from '../types/event'
import { settlementsApi } from '../api/settlements'
import { useQuery } from '../hooks/useQuery'
import { useMutation } from '../hooks/useMutation'
import EventResolutionCard from './EventResolutionCard'
import CreateResolutionForm from './CreateResolutionForm'
import QueryStatus from './QueryStatus'

interface Props {
  event: Event
  onResolved: () => void | Promise<void>
}

export default function EventCard({ event, onResolved }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [hasOpened, setHasOpened] = useState(false)
  const resolutionsId = useId()
  const expandButton = useRef<HTMLButtonElement>(null)
  return <div className="event-card">
    <div className="event-header"><h3>{event.name}</h3><p>{event.description}</p></div>
    <button ref={expandButton} hidden={expanded} aria-expanded={expanded} aria-controls={resolutionsId}
      onClick={() => { setHasOpened(true); setExpanded(true) }}>Избрать решение</button>
    <div id={resolutionsId} hidden={!expanded}>
      {hasOpened && <EventResolutions event={event} onResolved={onResolved} onCollapse={() => {
        setExpanded(false)
        // The trigger becomes visible after React commits the collapsed state.
        requestAnimationFrame(() => expandButton.current?.focus())
      }} />}
    </div>
  </div>
}

function EventResolutions({ event, onResolved, onCollapse }: Props & { onCollapse: () => void }) {
  const loader = useCallback((signal: AbortSignal) => settlementsApi.resolutions(event.id, signal), [event.id])
  const query = useQuery(loader)
  const mutation = useMutation()
  const [showForm, setShowForm] = useState(false)
  const [decided, setDecided] = useState(false)
  const disabled = mutation.pending || decided

  return <div className="event-resolutions">
    <div className="event-resolutions-heading">
      <h4>Вердикты:</h4>
      <button type="button" className="secondary-button" disabled={mutation.pending}
        onClick={onCollapse}>Скрыть варианты</button>
    </div>
    <QueryStatus {...query} onRetry={query.reload} />
    {query.data?.map(resolution => <EventResolutionCard key={resolution.id} resolution={resolution}
      disabled={disabled} onChoose={() => void mutation.run(async () => {
        await settlementsApi.decide(resolution.id)
        setDecided(true)
        await onResolved()
      })} />)}
    {query.data?.length === 0 && <p>Пока нет вердиктов. Создайте свой вариант.</p>}
    {decided && <p role="status">Решение принято.</p>}
    {!showForm && <button className="secondary-button" disabled={disabled || query.loading}
      onClick={() => setShowForm(true)}>Выбрать свой вариант</button>}
    {showForm && <CreateResolutionForm eventId={event.id} pending={disabled}
      onCancel={() => setShowForm(false)} onSubmit={data => void mutation.run(async () => {
        await settlementsApi.createResolution(data)
        setShowForm(false)
        await query.reload()
      })} />}
    {mutation.error && <p role="alert">{mutation.error}</p>}
  </div>
}

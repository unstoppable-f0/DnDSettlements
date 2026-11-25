import { useId, useRef, useState } from 'react'
import type { CreateEventResolution, SettlementEvent } from '../../api/models'
import EventResolutions from './EventResolutions'

interface Props {
  event: SettlementEvent
  disabled: boolean
  onDecide: (id: number) => void
  onCreate: (draft: CreateEventResolution) => Promise<boolean>
}

export default function EventCard({ event, disabled, onDecide, onCreate }: Props) {
  const [panel, setPanel] = useState<'unopened' | 'open' | 'closed'>('unopened')
  const resolutionsId = useId()
  const trigger = useRef<HTMLButtonElement>(null)

  function collapse() {
    setPanel('closed')
    requestAnimationFrame(() => trigger.current?.focus())
  }

  return (
    <article className="settlement-card">
      <header>
        <h3>{event.name}</h3>
        <p>{event.description}</p>
      </header>
      <button type="button" ref={trigger} hidden={panel === 'open'} aria-expanded={panel === 'open'}
        aria-controls={resolutionsId} onClick={() => setPanel('open')}>
        Избрать решение
      </button>
      <div id={resolutionsId} hidden={panel !== 'open'}>
        {panel !== 'unopened' && (
          <EventResolutions eventId={event.id} disabled={disabled} onDecide={onDecide} onCreate={onCreate} onCollapse={collapse} />
        )}
      </div>
    </article>
  )
}

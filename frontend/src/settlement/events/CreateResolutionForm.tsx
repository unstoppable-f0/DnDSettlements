import type { FormEvent } from 'react'
import type { CreateEventResolution } from '../../api/models'
import { assetFields } from '../assets/assetFields'

interface Props {
  eventId: number
  pending: boolean
  onSubmit: (draft: CreateEventResolution) => void
  onCancel: () => void
}

export default function CreateResolutionForm({ eventId, pending, onSubmit, onCancel }: Props) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    onSubmit({
      event_id: eventId,
      name: String(fields.get('name')),
      description: String(fields.get('description')),
      income: Number(fields.get('income')),
      coffers: Number(fields.get('coffers')),
      resources: Number(fields.get('resources')),
      defence: Number(fields.get('defence')),
    })
  }

  return (
    <form className="resolution-form" onSubmit={submit}>
      <h4>Свой собственный вердикт</h4>
      <label>Название вердикта<input name="name" required disabled={pending} /></label>
      <label>Описание<textarea name="description" disabled={pending} /></label>
      <div className="resolution-form-assets">
        {assetFields.map(([key, label]) => (
          <label key={key}>
            {label}
            <input name={key} type="number" defaultValue="0" step="1" min={Number.MIN_SAFE_INTEGER}
              max={Number.MAX_SAFE_INTEGER} required disabled={pending} />
          </label>
        ))}
      </div>
      <div className="resolution-form-actions">
        <button type="submit" disabled={pending}>Создать вердикт</button>
        <button type="button" className="secondary-button" disabled={pending} onClick={onCancel}>Отмена</button>
      </div>
    </form>
  )
}

import { useState } from 'react'
import type { CreateEventResolution } from '../types/eventResolution'

const assetFields = [
  ['income', 'Доход'], ['coffers', 'Казна'],
  ['resources', 'Ресурсы'], ['defence', 'Обороноспособность'],
] as const

interface Props {
  eventId: number
  pending: boolean
  onSubmit: (data: CreateEventResolution) => void
  onCancel: () => void
}

export default function CreateResolutionForm({ eventId, pending, onSubmit, onCancel }: Props) {
  const [values, setValues] = useState<CreateEventResolution>({
    event_id: eventId, name: '', description: '', income: 0, coffers: 0, resources: 0, defence: 0,
  })
  return <form className="resolution-form" onSubmit={event => {
    event.preventDefault()
    onSubmit(values)
  }}>
    <h4>Свой собственный вердикт</h4>
    <label>Название вердикта<input required disabled={pending} value={values.name}
      onChange={event => setValues({ ...values, name: event.target.value })} /></label>
    <label>Описание<textarea disabled={pending} value={values.description}
      onChange={event => setValues({ ...values, description: event.target.value })} /></label>
    <div className="resolution-form-assets">
      {assetFields.map(([key, label]) => <label key={key}>{label}
        <input type="number" step="1" required disabled={pending} value={values[key]}
          onChange={event => setValues({ ...values, [key]: Number(event.target.value) })} />
      </label>)}
    </div>
    <div className="resolution-form-actions">
      <button type="submit" disabled={pending}>{pending ? 'Сохранение...' : 'Создать вердикт'}</button>
      <button type="button" className="secondary-button" disabled={pending} onClick={onCancel}>Отмена</button>
    </div>
  </form>
}

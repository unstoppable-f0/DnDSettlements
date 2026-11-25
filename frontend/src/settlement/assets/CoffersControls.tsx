import { useState, type FormEvent } from 'react'
import type { CoffersOperation } from '../../api/settlements'

export type TransferGold = (operation: CoffersOperation, gold: number) => Promise<boolean>

interface Props {
  disabled: boolean
  onTransfer: TransferGold
}

const operations = [
  { id: 'donation', label: 'Внести золото', symbol: '+', className: 'coffers-button-plus' },
  { id: 'withdrawal', label: 'Забрать золото', symbol: '−', className: 'coffers-button-minus' },
] as const

export default function CoffersControls({ disabled, onTransfer }: Props) {
  const [operation, setOperation] = useState<typeof operations[number]>()
  const [amount, setAmount] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (operation && await onTransfer(operation.id, Number(amount))) setOperation(undefined)
  }

  return (
    <div className="coffers-controls">
      <div className="coffers-actions">
        {operations.map(option => (
          <button type="button" key={option.id} disabled={disabled} className={`coffers-button ${option.className}`}
            aria-label={option.label} title={option.label} onClick={() => {
              setAmount('')
              setOperation(option)
            }}>
            {option.symbol}
          </button>
        ))}
      </div>
      {operation && (
        <form className="coffers-form" onSubmit={submit}>
          <label>
            {operation.label}
            <input type="number" min="1" max={Number.MAX_SAFE_INTEGER} step="1" required autoFocus
              disabled={disabled} value={amount} onChange={event => setAmount(event.target.value)} />
          </label>
          <div className="coffers-form-actions">
            <button type="submit" disabled={disabled}>Подтвердить</button>
            <button type="button" disabled={disabled} onClick={() => setOperation(undefined)}>Отмена</button>
          </div>
        </form>
      )}
    </div>
  )
}

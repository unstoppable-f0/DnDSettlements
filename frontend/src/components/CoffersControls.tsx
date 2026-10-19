import { useState } from 'react'
import type { Asset } from '../types/asset'

interface CoffersControlsProps {
  settlementId: string
  onUpdated: (assets: Asset) => void
}

type Operation = 'donation' | 'withdrawal'

function CoffersControls({
  settlementId,
  onUpdated,
}: CoffersControlsProps) {
  const [operation, setOperation] = useState<Operation | null>(null)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    const gold = Number(amount)

    if (!Number.isSafeInteger(gold) || gold <= 0) {
      setError('Введите кол-во золота больше, чем 0.')
      return
    }

    const endpoint =
      operation === 'donation'
        ? `/api/assets/coffers_donation/${settlementId}`
        : `/api/assets/coffers_withdrawal/${settlementId}`

    const parameter =
      operation === 'donation' ? 'donated_gold' : 'withdrawn_gold'

    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        `${endpoint}?${parameter}=${gold}`,
        { method: 'PATCH' },
      )

      if (!response.ok) {
        throw new Error(
          response.status === 422
            ? 'Неразумное количество золото или проблемы с сетью.'
            : `Не удалось: (${response.statusText}).`,
        )
      }

      const updatedAssets: Asset = await response.json()
      onUpdated(updatedAssets)
      setOperation(null)
      setAmount('')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="coffers-controls">
      <div className="coffers-actions">
        <button
          type="button"
          className="coffers-button coffers-button-plus"
          aria-label="Donate gold"
          title="Donate gold"
          onClick={() => {
            setOperation('donation')
            setAmount('')
            setError('')
          }}
        >
          +
        </button>

        <button
          type="button"
          className="coffers-button coffers-button-minus"
          aria-label="Withdraw gold"
          title="Withdraw gold"
          onClick={() => {
            setOperation('withdrawal')
            setAmount('')
            setError('')
          }}
        >
          −
        </button>
      </div>

      {operation !== null && (
        <form
          className="coffers-form"
          onSubmit={event => {
            event.preventDefault()
            void handleSubmit()
          }}
        >
          <label>
            {operation === 'donation'
              ? 'Внести золото'
              : 'Забрать золото'}

            <input
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={event => setAmount(event.target.value)}
              disabled={loading}
              autoFocus
              required
            />
          </label>

          {error && <p className="coffers-error">{error}</p>}

          <div className="coffers-form-actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Подсчёт казны...' : 'Подтвердить'}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setOperation(null)
                setError('')
              }}
            >
              Отмена
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default CoffersControls

import { useState } from 'react'
import { settlementsApi, type CoffersOperation } from '../api/settlements'
import type { Asset } from '../types/asset'

interface CoffersControlsProps {
  settlementId: string
  onUpdated: (assets: Asset) => void | Promise<void>
}

type Operation = CoffersOperation

function CoffersControls({
  settlementId,
  onUpdated,
}: CoffersControlsProps) {
  const [operation, setOperation] = useState<Operation | null>(null)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!operation || loading) return
    const gold = Number(amount)

    if (!Number.isSafeInteger(gold) || gold <= 0) {
      setError('Введите кол-во золота больше, чем 0.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const updatedAssets = await settlementsApi.updateCoffers(settlementId, operation, gold)
      await onUpdated(updatedAssets)
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
          disabled={loading}
          className="coffers-button coffers-button-plus"
          aria-label="Donate gold"
          title="Внести золото"
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
          disabled={loading}
          className="coffers-button coffers-button-minus"
          aria-label="Withdraw gold"
          title="Забрать золото"
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

          {error && <p role="alert" className="coffers-error">{error}</p>}

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

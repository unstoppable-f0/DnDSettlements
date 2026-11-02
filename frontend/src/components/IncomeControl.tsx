import { settlementsApi } from '../api/settlements'
import { useMutation } from '../hooks/useMutation'
import type { Asset } from '../types/asset'

interface IncomeControlProps {
  settlementId: string
  income: number
  onUpdated: (assets: Asset) => void | Promise<void>
}

export default function IncomeControl({ settlementId, income, onUpdated }: IncomeControlProps) {
  const mutation = useMutation()
  const label = mutation.pending ? 'Начисление дохода...' : `Начислить доход в казну: ${income}`

  return <div className="income-control">
    <div className="coffers-actions">
      <button
        type="button"
        className="coffers-button income-button"
        aria-label={label}
        title={label}
        aria-busy={mutation.pending}
        disabled={mutation.pending || !Number.isSafeInteger(income) || income === 0}
        onClick={() => void mutation.run(async () => {
          const updatedAssets = await settlementsApi.updateCoffers(settlementId, 'donation', income)
          await onUpdated(updatedAssets)
        })}
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" />
          <path d="M12 6.5 16 12l-4 5.5L8 12Z" fill="currentColor" />
        </svg>
      </button>
    </div>
    {mutation.error && <p role="alert" className="coffers-error">{mutation.error}</p>}
  </div>
}

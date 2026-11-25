import type { Assets } from '../../api/models'
import CoffersControls, { type TransferGold } from './CoffersControls'
import './Assets.css'

interface Props {
  assets: Assets
  disabled: boolean
  incomeStale: boolean
  onTransfer: TransferGold
}

export default function AssetPanel({ assets, disabled, incomeStale, onTransfer }: Props) {
  const incomeLabel = `Начислить доход в казну: ${assets.income}`
  return (
    <section className="asset-panel">
      <h2>Активы поселения</h2>
      <div className="asset-grid">
        <div className="asset-card asset-income">
          <span className="asset-label">Доходность</span>
          <strong>{assets.income}</strong>
          <div className="coffers-actions">
            <button type="button" className="coffers-button income-button" aria-label={incomeLabel} title={incomeLabel}
              disabled={disabled || incomeStale || !Number.isSafeInteger(assets.income) || assets.income === 0}
              onClick={() => void onTransfer('donation', assets.income)}>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" />
                <path d="M12 6.5 16 12l-4 5.5L8 12Z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
        <div className="asset-card asset-coffers">
          <span className="asset-label">Казна</span>
          <strong>{assets.coffers}</strong>
          <CoffersControls disabled={disabled} onTransfer={onTransfer} />
        </div>
        <div className="asset-card asset-resources">
          <span className="asset-label">Ресурсы</span>
          <strong>{assets.resources}</strong>
        </div>
        <div className="asset-card asset-defence">
          <span className="asset-label">Обороноспособность</span>
          <strong>{assets.defence} / 20</strong>
        </div>
      </div>
    </section>
  )
}

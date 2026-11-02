import type { Asset } from '../types/asset'
import CoffersControls from './CoffersControls'
import IncomeControl from './IncomeControl'

interface AssetPanelProps {
  assets: Asset
  settlementId: string
  onAssetsUpdated: (assets: Asset) => void | Promise<void>
}

function AssetPanel({
  assets,
  settlementId,
  onAssetsUpdated,
}: AssetPanelProps) {
  return (
    <section className="asset-panel">
      <h2>Активы поселения</h2>

      <div className="asset-grid">
        <div className="asset-card asset-income">
          <span className="asset-label">Доходность</span>
          <strong>{assets.income}</strong>
          <IncomeControl
            settlementId={settlementId}
            income={assets.income}
            onUpdated={onAssetsUpdated}
          />
        </div>

        <div className="asset-card asset-coffers">
          <span className="asset-label">Казна</span>

          <strong>{assets.coffers}</strong>

          <CoffersControls
            settlementId={settlementId}
            onUpdated={onAssetsUpdated}
          />
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

export default AssetPanel

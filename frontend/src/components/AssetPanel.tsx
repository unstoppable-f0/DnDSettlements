import type { Asset } from '../types/asset'

interface AssetPanelProps {
  assets: Asset
}

function AssetPanel({ assets }: AssetPanelProps) {
  return (
    <section className="asset-panel">
      <h2>Активы поселения</h2>

      <div className="asset-grid">
        <div className="asset-card">
          <span className="asset-label">Доходность</span>
          <strong>{assets.income}</strong>
        </div>

        <div className="asset-card">
          <span className="asset-label">Казна</span>
          <strong>{assets.coffers}</strong>
        </div>

        <div className="asset-card">
          <span className="asset-label">Ресурсы</span>
          <strong>{assets.resources}</strong>
        </div>

        <div className="asset-card">
          <span className="asset-label">Обороноспособность</span>
          <strong>{assets.defence} / 20</strong>
        </div>
      </div>
    </section>
  )
}

export default AssetPanel
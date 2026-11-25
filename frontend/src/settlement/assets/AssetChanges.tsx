import type { Assets } from '../../api/models'
import { assetFields } from './assetFields'

export default function AssetChanges({ values }: { values: Assets }) {
  return (
    <div className="asset-changes">
      {assetFields.map(([key, label]) => {
        const value = values[key]
        const sign = value > 0 ? 'positive' : value < 0 ? 'negative' : 'neutral'
        return (
          <div key={key} className={`asset-change asset-change-${sign}`}>
            <span>{label}</span>
            <strong>{value > 0 ? '+' : ''}{value}</strong>
          </div>
        )
      })}
    </div>
  )
}

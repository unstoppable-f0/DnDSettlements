import type { Asset } from "../types/asset.ts";

interface AssetPanelProps {
  assets: Asset
}

function AssetPanel({ assets }: AssetPanelProps) {
  return (
    <section>
      <h2>Settlement Assets</h2>

      <p style={{'color': 'orange'}}>Доход: {assets.income}</p>
      <p style={{'color': 'darkorange'}}>Казна: {assets.coffers}</p>
      <p style={{'color': 'saddlebrown'}}>Ресурсы: {assets.resources}</p>
      <p style={{'color': 'indianred'}}>Обороноспособность: {assets.defence} / 20</p>
    </section>
  )
}

export default AssetPanel
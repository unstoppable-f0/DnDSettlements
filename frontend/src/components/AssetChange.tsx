interface AssetChangeProps {
  label: string
  value: number
}

function AssetChange({ label, value }: AssetChangeProps) {
  return (
    <div className={`asset-change asset-change-${value > 0 ? 'positive' : value < 0 ? 'negative' : 'neutral'}`}>
      <span>{label}</span>
      <strong>
        {value > 0 ? '+' : ''}
        {value}
      </strong>
    </div>
  )
}

export default AssetChange
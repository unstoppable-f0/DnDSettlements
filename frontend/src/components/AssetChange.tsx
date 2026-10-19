interface AssetChangeProps {
  label: string
  value: number
}

function AssetChange({ label, value }: AssetChangeProps) {
  return (
    <div className="asset-change">
      <span>{label}</span>
      <strong>
        {value > 0 ? '+' : ''}
        {value}
      </strong>
    </div>
  )
}

export default AssetChange
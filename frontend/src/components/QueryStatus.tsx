interface Props {
  loading: boolean
  error?: string
  onRetry: () => void
}

export default function QueryStatus({ loading, error, onRetry }: Props) {
  if (error) return <div role="alert"><p>{error}</p><button onClick={onRetry}>Повторить загрузку</button></div>
  if (loading) return <p role="status">Загрузка...</p>
  return null
}

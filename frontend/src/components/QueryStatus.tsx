interface Props {
  loading: boolean
  error?: string
  reload: () => void
}

export default function QueryStatus({ loading, error, reload }: Props) {
  if (error) {
    return (
      <div role="alert">
        <p>{error}</p>
        <button type="button" onClick={reload}>Повторить загрузку</button>
      </div>
    )
  }
  if (loading) return <p role="status">Загрузка...</p>
  return null
}

import { Link } from 'react-router'

interface Props {
  to: string
  name: string
  heading: 'h2' | 'h3'
}

export default function DirectoryCard({ to, name, heading: Heading }: Props) {
  return (
    <Link to={to} className="campaign-card">
      <Heading>{name}</Heading>
      <span className="campaign-card-arrow" aria-hidden="true">↗</span>
    </Link>
  )
}

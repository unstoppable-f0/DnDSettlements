import { Link } from 'react-router'
import './Navigation.css'

interface BackLinkProps {
  to: string
  label: string
}

export default function BackLink({ to, label }: BackLinkProps) {
  return <Link className="back-link" to={to}>
    <span className="back-link-arrow" aria-hidden="true">←</span>
    {label}
  </Link>
}

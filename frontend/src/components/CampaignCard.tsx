import { Link } from 'react-router'
import type { Campaign } from '../types/campaign'

interface CampaignCardProps {
  campaign: Campaign
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
  return <Link to={`/campaigns/${campaign.id}`} className="campaign-card">
    <h2>{campaign.name}</h2>
    <span className="campaign-card-arrow" aria-hidden="true">↗</span>
  </Link>
}

import { Link } from 'react-router'

interface Campaign {
  id: number
  name: string
}

interface CampaignCardProps {
  campaign: Campaign
}

function CampaignCard({ campaign }: CampaignCardProps) {
  return (
    <div>
      <h2>{campaign.name}</h2>

      <Link to={`/campaigns/${campaign.id}`}>
        Enter
      </Link>
    </div>
  )
}

export default CampaignCard

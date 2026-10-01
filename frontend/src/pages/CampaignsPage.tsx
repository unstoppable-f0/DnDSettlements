import { useEffect, useState } from 'react'
import CampaignCard from '../components/CampaignCard.tsx'

interface Campaign {
  id: number
  name: string
}

function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  useEffect(() => {
    fetch('http://localhost:8000/campaigns/')
      .then(response => response.json())
      .then(data => setCampaigns(data))
  }, [])

  return (
    <main>
      <h1>Choose campaign</h1>

      {campaigns.map(campaign => (
        <CampaignCard
          key={campaign.id}
          campaign={campaign}
        />
      ))}
    </main>
  )
}

export default CampaignsPage

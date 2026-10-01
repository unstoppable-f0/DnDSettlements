import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import SettlementCard from '../components/SettlementCard'


interface Campaign {
  id: number
  name: string
}

interface Settlement {
  id: number
  name: string
  campaign: string
}

function CampaignPage() {
  const { campaignId } = useParams()

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [settlements, setSettlements] = useState<Settlement[]>([])

  useEffect(() => {
    fetch(`http://localhost:8000/campaigns/${campaignId}`)
      .then(response => response.json())
      .then(data => setCampaign(data))
  }, [campaignId])

  useEffect(() => {
    if (!campaign) {
      return
    }

    fetch(
      `http://localhost:8000/settlements/${encodeURIComponent(campaign.name)}`
    )
      .then(response => response.json())
      .then(data => setSettlements(data))
  }, [campaign])

  if (!campaign) {
    return <p>Loading campaign...</p>
  }

  return (
    <main>
      <h1>{campaign.name}</h1>

      <h2>Settlements</h2>

      {settlements.map(settlement => (
          <SettlementCard
            key={settlement.id}
            settlement={settlement}
          />
      ))}
    </main>
  )
}

export default CampaignPage
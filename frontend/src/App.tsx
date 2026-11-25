import { Routes, Route, Navigate } from 'react-router'
import CampaignsPage from './campaigns/CampaignsPage'
import CampaignPage from './campaigns/CampaignPage'
import SettlementPage from './settlement/SettlementPage'

export default function App() {
  return (
    <Routes>
      <Route path="/campaigns" element={<CampaignsPage />} />
      <Route path="/campaigns/:campaignId" element={<CampaignPage />} />
      <Route path="/settlements/:settlementId" element={<SettlementPage />} />
      <Route path="*" element={<Navigate to="/campaigns" replace />} />
    </Routes>
  )
}

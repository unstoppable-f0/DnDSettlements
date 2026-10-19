import { Routes, Route, Navigate } from 'react-router'
import CampaignsPage from './pages/CampaignsPage'
import CampaignPage from './pages/CampaignPage'
import SettlementPage from './pages/SettlementPage'

function App() {
  return (
    <Routes>
      <Route path="/campaigns" element={<CampaignsPage />} />
      <Route path="/campaigns/:campaignId" element={<CampaignPage />} />
      <Route path="/settlements/:settlementId" element={<SettlementPage />} />

      <Route
        path="*"
        element={<Navigate to="/campaigns" replace />}
      />
    </Routes>
  )
}

export default App
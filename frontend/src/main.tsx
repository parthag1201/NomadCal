import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import AppLayout from './layout/AppLayout.tsx'
import DashboardPage from './pages/DashboardPage.tsx'
import PlaceholderPage from './pages/PlaceholderPage.tsx'
import { PreferencesPage } from './pages/PreferencesPage.tsx'
import { ItinerariesPage } from './pages/ItinerariesPage.tsx'
import { InsightsPage } from './pages/InsightsPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="planner" element={<App />} />
          <Route
            path="preferences"
            element={<PreferencesPage />}
          />
          <Route
            path="itineraries"
            element={<ItinerariesPage />}
          />
          <Route
            path="insights"
            element={<InsightsPage />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewsManager from './pages/NewsManager';
import BannerManager from './pages/BannerManager';
import MediaManager from './pages/MediaManager';
import PastorWorkManager from './pages/PastorWorkManager';
import GroupManager from './pages/GroupManager';
import OfferingReport from './pages/OfferingReport';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/news" element={<NewsManager />} />
                    <Route path="/banners" element={<BannerManager />} />
                    <Route path="/media" element={<MediaManager />} />
                    <Route path="/pastor-works" element={<PastorWorkManager />} />
                    <Route path="/groups" element={<GroupManager />} />
                    <Route path="/offering" element={<OfferingReport />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

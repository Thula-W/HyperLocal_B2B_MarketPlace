import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import BusinessCompletionGuard from './components/BusinessCompletionGuard';
import LandingPage from './pages/LandingPage';
import SignInPage from './pages/SignInPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import MakeListingPage from './pages/MakeListingPage';
import PricingPage from './pages/PricingPage';
import CatalogPage from './pages/CatalogPage';
import RegisterCompanyPage from './pages/RegisterCompanyPage';
import NearbyBusinessesPage from './pages/NearbyBusinessesPage';
import AuctionCatalogPage from './pages/AuctionCatalogPage';
import CreateAuctionPage from './pages/CreateAuctionPage';
import AuctionDetailPage from './pages/AuctionDetailPage';

const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
  </div>
);

const AppContent = () => {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/register" element={<RegisterPage />} />        <Route path="/pricing" element={<PricingPage />} />        <Route 
          path="/catalog" 
          element={
            <ProtectedRoute>
              <BusinessCompletionGuard>
                <CatalogPage />
              </BusinessCompletionGuard>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/nearby" 
          element={
            <ProtectedRoute>
              <BusinessCompletionGuard>
                <NearbyBusinessesPage />
              </BusinessCompletionGuard>
            </ProtectedRoute>
          } 
        />
        <Route path="/register-company" element={<RegisterCompanyPage />} />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />        <Route 
          path="/make-listing" 
          element={
            <ProtectedRoute>
              <BusinessCompletionGuard>
                <MakeListingPage />
              </BusinessCompletionGuard>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/auctions" 
          element={
            <ProtectedRoute>
              <BusinessCompletionGuard>
                <AuctionCatalogPage />
              </BusinessCompletionGuard>
            </ProtectedRoute>
          } 
        />        <Route 
          path="/auctions/create" 
          element={
            <ProtectedRoute>
              <BusinessCompletionGuard>
                <CreateAuctionPage />
              </BusinessCompletionGuard>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/auctions/:id" 
          element={
            <ProtectedRoute>
              <BusinessCompletionGuard>
                <AuctionDetailPage />
              </BusinessCompletionGuard>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
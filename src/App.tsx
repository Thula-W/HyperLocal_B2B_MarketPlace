import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import SignInPage from './pages/SignInPage';
import ProfilePage from './pages/ProfilePage';
import MakeListingPage from './pages/MakeListingPage';
import PricingPage from './pages/PricingPage';
import CatalogPage from './pages/CatalogPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/make-listing" element={<MakeListingPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/catalog" element={<CatalogPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
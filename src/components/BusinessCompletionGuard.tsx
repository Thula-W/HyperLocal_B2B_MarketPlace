import React from 'react';
import { Building, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

interface BusinessCompletionGuardProps {
  children: React.ReactNode;
}

const BusinessCompletionGuard: React.FC<BusinessCompletionGuardProps> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Get the page user was trying to access
  const intendedDestination = location.state?.from?.pathname || '/profile';
  const isRequiredByRoute = location.state?.requireCompany;

  // If user has company details, render children
  if (user?.companyDetails) {
    return <>{children}</>;
  }

  const handleComplete = () => {
    // Redirect to profile page with a flag to open the completion modal
    navigate('/profile', { 
      replace: true,
      state: { 
        requireCompany: true,
        from: location.state?.from || { pathname: intendedDestination }
      }
    });
  };

  const handleSkip = () => {
    // Only allow skipping if not required by a specific route
    if (!isRequiredByRoute) {
      navigate('/profile', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <Building className="h-16 w-16 text-primary-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Complete Your Business Profile
            </h2>
            <p className="text-gray-600">
              {isRequiredByRoute 
                ? "Complete business information is required to access this feature."
                : "Help other businesses find and connect with you by providing your complete company information."
              }
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">What you'll need to provide:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Company name and business type</li>
                <li>• Contact information (email, phone, address)</li>
                <li>• Business description (optional)</li>
                <li>• Website and registration details (optional)</li>
              </ul>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleComplete}
                className="flex-1 btn-primary py-3"
              >
                Complete Business Profile
              </button>
              
              {!isRequiredByRoute && (
                <button
                  onClick={handleSkip}
                  className="btn-outline px-6 py-3"
                >
                  Skip for now
                </button>
              )}
            </div>

            {isRequiredByRoute && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-amber-400 mr-2" />
                  <p className="text-sm text-amber-700">
                    Complete business information is required to create listings and engage with other businesses.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessCompletionGuard;

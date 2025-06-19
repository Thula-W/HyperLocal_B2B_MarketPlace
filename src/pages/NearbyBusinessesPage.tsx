import React, { useState, useEffect } from 'react';
import { MapPin, Building, Phone, Mail, Globe, Navigation, Filter, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getNearbyBusinesses } from '../services/mapsService';

interface NearbyBusiness {
  id: string;
  name: string;
  address: string;
  businessType: string;
  telephone?: string;
  email?: string;
  website?: string;
  description?: string;
  distance?: number; // in kilometers
  coordinates?: {
    lat: number;
    lng: number;
  };
}

const NearbyBusinessesPage: React.FC = () => {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<NearbyBusiness[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [radiusKm, setRadiusKm] = useState(10);
  const [selectedBusinessType, setSelectedBusinessType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');  
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const businessTypes = [
    'Sole Proprietor',
    'Partnership', 
    'Pvt Ltd',
    'LLC',
    'Public Ltd',
    'Non-Profit',
    'Other'
  ];

  const loadNearbyBusinesses = React.useCallback(async () => {
    if (!user?.companyDetails?.address) {
      setError('Your business address is required to find nearby businesses.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await getNearbyBusinesses(
        user.companyDetails.address,
        radiusKm,
        selectedBusinessType
      );
      
      setBusinesses(result.businesses);
      setUserLocation(result.userLocation);
    } catch (err) {
      console.error('Error loading nearby businesses:', err);
      setError('Failed to load nearby businesses. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.companyDetails?.address, radiusKm, selectedBusinessType]);

  useEffect(() => {
    if (user?.companyDetails?.address) {
      loadNearbyBusinesses();
    }
  }, [user, loadNearbyBusinesses]);

  const filteredBusinesses = businesses.filter(business =>
    searchTerm === '' || 
    business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.businessType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openInMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  if (!user?.companyDetails?.address) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Business Address Required</h2>
            <p className="text-gray-600 mb-6">
              Please complete your business profile with your address to discover nearby businesses.
            </p>
            <button
              onClick={() => window.location.href = '/profile'}
              className="btn-primary"
            >
              Complete Business Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Nearby Businesses</h1>
          <p className="text-gray-600">
            Discover businesses near your location: {user.companyDetails.address}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Search businesses..."
                />
              </div>
            </div>

            {/* Business Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Type
              </label>
              <div className="relative">
                <Filter className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                <select
                  value={selectedBusinessType}
                  onChange={(e) => setSelectedBusinessType(e.target.value)}
                  className="input-field pl-10"
                >
                  <option value="">All Types</option>
                  {businessTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Radius */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Radius ({radiusKm} km)
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1km</span>
                <span>50km</span>
              </div>
            </div>

            {/* Refresh Button */}
            <div className="flex items-end">
              <button
                onClick={loadNearbyBusinesses}
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Navigation className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Loading...' : 'Find Businesses'}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Business List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Found {filteredBusinesses.length} businesses
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {filteredBusinesses.length > 0 ? (
                filteredBusinesses.map((business) => (
                  <div key={business.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {business.name}
                        </h3>
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {business.businessType}
                        </span>
                      </div>
                      {business.distance && (
                        <span className="text-sm text-gray-500 font-medium">
                          {business.distance.toFixed(1)} km
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="flex-1">{business.address}</span>
                        <button
                          onClick={() => openInMaps(business.address)}
                          className="text-primary-600 hover:text-primary-700 ml-2"
                          title="Open in Maps"
                        >
                          <Navigation className="h-4 w-4" />
                        </button>
                      </div>

                      {business.telephone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          <a href={`tel:${business.telephone}`} className="hover:text-primary-600">
                            {business.telephone}
                          </a>
                        </div>
                      )}

                      {business.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          <a href={`mailto:${business.email}`} className="hover:text-primary-600">
                            {business.email}
                          </a>
                        </div>
                      )}

                      {business.website && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Globe className="h-4 w-4 mr-2 text-gray-400" />
                          <a 
                            href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary-600"
                          >
                            {business.website}
                          </a>
                        </div>
                      )}
                    </div>

                    {business.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {business.description}
                      </p>
                    )}

                    <div className="mt-4">
                      <button className="btn-outline text-sm">
                        View Details
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {loading ? 'Searching for businesses...' : 'No businesses found in this area.'}
                  </p>
                </div>
              )}
            </div>
          </div>          {/* Map Placeholder */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Map View</h2>
            <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Interactive Map</p>
                <p className="text-sm text-gray-400 mb-2">
                  Google Maps integration will be implemented here
                </p>
                {userLocation && (
                  <p className="text-xs text-gray-500">
                    Your location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NearbyBusinessesPage;

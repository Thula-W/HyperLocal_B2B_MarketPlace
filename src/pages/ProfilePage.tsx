import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  User, 
  Package, 
  MessageSquare, 
  Plus, 
  TrendingUp, 
  Eye,
  Mail,
  DollarSign,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserListings, getUserInquiries, Listing, Inquiry } from '../services/firestore';
import ProfileCompletionModal from '../components/ProfileCompletionModal';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [listings, setListings] = useState<Listing[]>([]);
  const [inquiries, setInquiries] = useState<{ sent: Inquiry[], received: Inquiry[] }>({ sent: [], received: [] });  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const fetchData = useCallback(async () => {
    if (!user) return;
    
    console.log('Fetching profile data for user:', user.id);
    setLoading(true);
    try {
      const [userListings, userInquiries] = await Promise.all([
        getUserListings(user.id),
        getUserInquiries(user.id)
      ]);
      
      console.log('Fetched listings:', userListings.length);
      console.log('Fetched inquiries:', userInquiries);
      
      setListings(userListings);
      setInquiries(userInquiries);

      // Show profile completion modal for Google users without company info
      if (!user.company && user.name) {
        setShowProfileModal(true);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  // Refresh data when returning from other pages (like after creating a listing)
  useEffect(() => {
    if (location.state?.refresh) {
      console.log('Refreshing data due to navigation state');
      fetchData();
      // Clear the refresh flag to prevent multiple refreshes
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [location.state, fetchData]);

  // Set up real-time listener for listings when component mounts
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupRealtimeListener = async () => {
      if (!user) return;

      try {
        const { onSnapshot, collection, query, where, orderBy } = await import('firebase/firestore');
        const { db } = await import('../firebase/firebase');

        const q = query(
          collection(db, 'listings'),
          where('userId', '==', user.id),
          orderBy('createdAt', 'desc')
        );

        unsubscribe = onSnapshot(q, (querySnapshot) => {
          const newListings: Listing[] = [];
          querySnapshot.forEach((doc) => {
            newListings.push({ id: doc.id, ...doc.data() } as Listing);
          });
          console.log('Real-time update: received', newListings.length, 'listings');
          setListings(newListings);
        }, (error) => {
          console.error('Real-time listener error:', error);
        });
      } catch (error) {
        console.error('Error setting up real-time listener:', error);
      }
    };

    setupRealtimeListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  // Calculate stats from real data
  const stats = {
    totalListings: listings.length,
    totalInquiries: inquiries.sent.length + inquiries.received.length,
    inquiriesReceived: inquiries.received.length,
    inquiriesMade: inquiries.sent.length,
    profileCompletion: user?.name && user?.company && user?.email ? 85 : 65
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'listings', label: 'My Listings', icon: Package },
    { id: 'inquiries-received', label: 'Inquiries Received', icon: MessageSquare },
    { id: 'inquiries-made', label: 'Inquiries Made', icon: Mail }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
                <p className="text-gray-600">{user?.company}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-gray-700">Profile Completion</span>
                <span className="text-sm font-bold text-primary-600">{stats.profileCompletion}%</span>
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full" 
                  style={{ width: `${stats.profileCompletion}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-primary-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <Package className="h-8 w-8 text-primary-600" />
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900">{stats.totalListings}</p>
                      <p className="text-primary-600">Active Listings</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <MessageSquare className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900">{stats.inquiriesReceived}</p>
                      <p className="text-blue-600">Inquiries Received</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <Mail className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900">{stats.inquiriesMade}</p>
                      <p className="text-green-600">Inquiries Made</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900 capitalize">{user?.plan}</p>
                      <p className="text-purple-600">Current Plan</p>
                    </div>
                  </div>
                </div>
              </div>              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link
                    to="/make-listing"
                    className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <Plus className="h-6 w-6 text-primary-600 mb-2" />
                    <h4 className="font-medium text-gray-900">Create New Listing</h4>
                    <p className="text-sm text-gray-500">Share your products or services</p>
                  </Link>

                  <Link
                    to="/catalog"
                    className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <Package className="h-6 w-6 text-blue-600 mb-2" />
                    <h4 className="font-medium text-gray-900">Browse Catalog</h4>
                    <p className="text-sm text-gray-500">Find products and services</p>
                  </Link>

                  <Link
                    to="/pricing"
                    className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <TrendingUp className="h-6 w-6 text-green-600 mb-2" />
                    <h4 className="font-medium text-gray-900">Upgrade Plan</h4>
                    <p className="text-sm text-gray-500">Get more features</p>
                  </Link>
                </div>
              </div>

              {/* Recent Listings Preview */}
              {listings.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6 mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Listings</h3>
                    <button
                      onClick={() => setActiveTab('listings')}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-3">
                    {listings.slice(0, 3).map((listing) => (
                      <div key={listing.id} className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{listing.title}</h4>
                            <p className="text-sm text-gray-600">{listing.price}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            listing.type === 'service' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {listing.type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}          {activeTab === 'listings' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">My Listings</h3>
                <div className="flex space-x-3">
                  <button
                    onClick={fetchData}
                    disabled={loading}
                    className="btn-outline flex items-center space-x-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                  <Link
                    to="/make-listing"
                    className="btn-primary"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    <span>Add New Listing</span>
                  </Link>
                </div>
              </div>
              
              <div className="grid gap-6">
                {listings.length > 0 ? listings.map((listing) => (
                  <div key={listing.id} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">{listing.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            listing.type === 'service' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {listing.type}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">{listing.price}</p>
                        <p className="text-sm text-gray-500 mb-4">{listing.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>{listing.inquiries || 0} inquiries</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>{listing.views || 0} views</span>
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          listing.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {listing.status}
                        </span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No listings yet</h3>
                    <p className="text-gray-500 mb-4">Create your first listing to start connecting with other businesses.</p>
                    <Link
                      to="/make-listing"
                      className="btn-primary"
                    >
                      Create Your First Listing
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'inquiries-received' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Inquiries Received</h3>
              <div className="space-y-4">
                {inquiries.received.length > 0 ? inquiries.received.map((inquiry) => (
                  <div key={inquiry.id} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900">{inquiry.fromUserName}</h4>
                        <p className="text-sm text-gray-500">{inquiry.fromUserCompany}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        inquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        inquiry.status === 'responded' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {inquiry.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Re: {inquiry.listingTitle}</p>
                    <p className="text-gray-600 mb-4">{inquiry.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(inquiry.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No inquiries received</h3>
                    <p className="text-gray-500">When others inquire about your listings, they'll appear here.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'inquiries-made' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Inquiries Made</h3>
              <div className="space-y-4">
                {inquiries.sent.length > 0 ? inquiries.sent.map((inquiry) => (
                  <div key={inquiry.id} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900">To: {inquiry.toUserEmail}</h4>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        inquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        inquiry.status === 'responded' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {inquiry.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Re: {inquiry.listingTitle}</p>
                    <p className="text-gray-600 mb-4">{inquiry.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(inquiry.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No inquiries made</h3>
                    <p className="text-gray-500">When you inquire about listings, they'll appear here.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Completion Modal */}
        {showProfileModal && (      <ProfileCompletionModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
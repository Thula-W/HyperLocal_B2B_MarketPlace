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
  RefreshCw,
  Building,
  AlertCircle,
  Gavel,
  Trophy,
  Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserListings, getUserInquiries, Listing, Inquiry, updateInquiry, getUserAuctions, getUserBids, AuctionListing, AuctionBid, deleteListing, deleteAuction } from '../services/firestore';
import ProfileCompletionModal from '../components/ProfileCompletionModal';
import { InquiryChat } from '../components/InquiryChat';
import { ImageGallery } from '../components/ImageDisplay';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();  const [activeTab, setActiveTab] = useState('overview');
  const [listings, setListings] = useState<Listing[]>([]);
  const [inquiries, setInquiries] = useState<{ sent: Inquiry[], received: Inquiry[] }>({ sent: [], received: [] });
  const [auctions, setAuctions] = useState<AuctionListing[]>([]);
  const [userBids, setUserBids] = useState<{ auction: AuctionListing, bid: AuctionBid }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);  
  const [openChatInquiry, setOpenChatInquiry] = useState<Inquiry | null>(null);

  // Helper function to format price with dollar sign
  const formatPrice = (price: string) => {
    if (!price) return '$0';
    
    // Remove any existing currency symbols and spaces
    const cleanPrice = price.replace(/[$,\s]/g, '');
    
    // Check if it's a valid number
    const numericPrice = parseFloat(cleanPrice);
    if (isNaN(numericPrice)) {
      // If not a number, return as-is but ensure it has $ prefix
      return price.includes('$') ? price : `$${price}`;
    }
    
    // Format as currency
    return `$${numericPrice.toLocaleString()}`;
  };
  const fetchData = useCallback(async () => {
    if (!user) return;
    
    console.log('Fetching profile data for user:', user.id);
    setLoading(true);
    try {
      const [userListings, userInquiries, userAuctions, userBidsData] = await Promise.all([
        getUserListings(user.id),
        getUserInquiries(user.id),
        getUserAuctions(user.id),
        getUserBids(user.id)
      ]);
        console.log('Fetched listings:', userListings.length);
      console.log('Fetched inquiries:', userInquiries);
      console.log('Fetched auctions:', userAuctions.length);
      console.log('Fetched bids:', userBidsData.length);
      console.log('Inquiries sent:', userInquiries.sent);
      console.log('Inquiries received:', userInquiries.received);
      
      setListings(userListings);
      setInquiries(userInquiries);
      setAuctions(userAuctions);
      setUserBids(userBidsData);      // Show profile completion modal for users without company info
      // or when explicitly required by route
      if (!user.companyDetails && user.name) {
        setShowProfileModal(true);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  // Check if user was redirected here for business completion
  useEffect(() => {
    if (location.state?.requireCompany && !user?.companyDetails) {
      setShowProfileModal(true);
    }
  }, [location.state, user?.companyDetails]);

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
      if (!user) return;      try {
        const { onSnapshot, collection, query, where } = await import('firebase/firestore');
        const { db } = await import('../firebase/firebase');

        // Simplified query without orderBy to avoid index requirements
        const q = query(
          collection(db, 'listings'),
          where('userId', '==', user.id)
        );

        unsubscribe = onSnapshot(q, (querySnapshot) => {
          const newListings: Listing[] = [];
          querySnapshot.forEach((doc) => {
            newListings.push({ id: doc.id, ...doc.data() } as Listing);
          });
          
          // Sort by createdAt in the frontend
          newListings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          
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
    profileCompletion: (() => {
      let completion = 0;
      
      // Personal info (30%)
      if (user?.name) completion += 15;
      if (user?.email) completion += 15;
      
      // Basic business info (50%)
      if (user?.companyDetails?.name) completion += 15;
      if (user?.companyDetails?.businessType) completion += 10;
      if (user?.companyDetails?.email) completion += 10;
      if (user?.companyDetails?.telephone) completion += 8;
      if (user?.companyDetails?.address) completion += 7;
      
      // Optional business info (20%)
      if (user?.companyDetails?.description) completion += 7;
      if (user?.companyDetails?.website) completion += 6;
      if (user?.companyDetails?.registrationNumber) completion += 4;
      if (user?.companyDetails?.operatingSince) completion += 3;
      
      return Math.min(completion, 100);
    })()
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
  }  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'business', label: 'Business Profile', icon: Building },
    { id: 'listings', label: 'My Listings', icon: Package },
    { id: 'auctions', label: 'My Auctions', icon: Gavel },
    { id: 'bids', label: 'My Bids', icon: Trophy },
    { id: 'inquiries-received', label: 'Inquiries Received', icon: MessageSquare },
    { id: 'inquiries-made', label: 'Inquiries Made', icon: Mail }
  ];
  // Accept inquiry: set status to "accepted"
  const handleAccept = async (inquiryId: string) => {
    try {
      await updateInquiry(inquiryId, { status: "accepted" });
      // Refresh inquiries to show updated status
      if (user) {
        const userInquiries = await getUserInquiries(user.id);
        setInquiries(userInquiries);
      }
    } catch (error) {
      console.error("Failed to accept inquiry:", error);
    }
  };

  // Reject inquiry: set status to "rejected"
  const handleReject = async (inquiryId: string) => {
    try {
      await updateInquiry(inquiryId, { status: "rejected" });
      // Refresh inquiries to show updated status
      if (user) {
        const userInquiries = await getUserInquiries(user.id);
        setInquiries(userInquiries);
      }
    } catch (error) {
      console.error("Failed to reject inquiry:", error);
    }
  };
  // Open chat: set the inquiry to open in chat modal
  const handleOpenChat = (inquiry: Inquiry) => {
    setOpenChatInquiry(inquiry);
  };

  // Delete listing
  const handleDeleteListing = async (listingId: string, listingTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${listingTitle}"? This action cannot be undone.`)) {
      try {
        await deleteListing(listingId);
        // Refresh listings after deletion
        if (user) {
          const userListings = await getUserListings(user.id);
          setListings(userListings);
        }
        alert('Listing deleted successfully!');
      } catch (error) {
        console.error('Error deleting listing:', error);
        alert('Failed to delete listing. Please try again.');
      }
    }
  };

  // Delete auction
  const handleDeleteAuction = async (auctionId: string, auctionTitle: string) => {
    if (window.confirm(`Are you sure you want to delete the auction "${auctionTitle}"? This action cannot be undone and will affect any existing bids.`)) {
      try {
        await deleteAuction(auctionId);
        // Refresh auctions after deletion
        if (user) {
          const userAuctionsData = await getUserAuctions(user.id);
          setAuctions(userAuctionsData);
        }
        alert('Auction deleted successfully!');
      } catch (error) {
        console.error('Error deleting auction:', error);
        alert('Failed to delete auction. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-6">
              <div className="bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-primary-600" />
              </div>
              
              {/* Personal Information */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{user?.name}</h1>
                <p className="text-gray-600 mb-3">{user?.email}</p>
                  {/* Business Information */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Building className="h-5 w-5 mr-2 text-primary-600" />
                      Business Information
                    </h3>
                    <button
                      onClick={() => setShowProfileModal(true)}
                      className="btn-outline text-sm py-1 px-3"
                    >
                      {user?.companyDetails ? 'Edit' : 'Add Business Info'}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Company Name</p>
                      <p className="text-gray-900">
                        {user?.companyDetails?.name || user?.company || <span className="text-gray-500 italic">Not provided</span>}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Business Type</p>
                      <p className="text-gray-900">
                        {user?.companyDetails?.businessType || <span className="text-gray-500 italic">Not provided</span>}
                      </p>
                    </div>
                    {user?.companyDetails?.telephone && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Telephone</p>
                        <p className="text-gray-900">{user.companyDetails.telephone}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-700">Subscription Plan</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        user?.plan === 'premium' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user?.plan ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1) : 'Free'}
                      </span>
                    </div>
                  </div>
                  
                  {!user?.companyDetails && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-amber-400 mr-2" />
                        <p className="text-sm text-amber-700">
                          Complete your business information to access all features and improve your visibility.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Profile Completion */}
            <div className="text-right ml-6">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-gray-700">Profile Completion</span>
                <span className="text-sm font-bold text-primary-600">{stats.profileCompletion}%</span>
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2 mb-3">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${stats.profileCompletion}%` }}
                ></div>
              </div>              <button
                onClick={() => setShowProfileModal(true)}
                className="btn-primary text-sm py-2 px-4 w-full"
              >
                {user?.companyDetails ? 'Edit Profile' : 'Complete Profile'}
              </button>
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
                            <p className="text-sm text-gray-600">{formatPrice(listing.price)}</p>
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
          )}{activeTab === 'listings' && (
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
              
              <div className="grid gap-6">                {listings.length > 0 ? listings.map((listing) => (
                  <div key={listing.id} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex gap-4">
                      {/* Image Section */}
                      {listing.images && listing.images.length > 0 && (
                        <div className="w-32 h-32 flex-shrink-0">
                          <ImageGallery
                            images={listing.images}
                            alt={listing.title}
                            className="w-full h-full"
                            imageClassName="w-full h-full object-cover rounded-lg"
                            maxImages={1}
                          />
                        </div>
                      )}
                      
                      {/* Content Section */}
                      <div className="flex-1">
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
                            </div>                            <p className="text-gray-600 mb-2">{formatPrice(listing.price)}</p>
                            {listing.type === 'product' && listing.quantity && (
                              <p className="text-sm text-gray-500 mb-2 flex items-center">
                                <Package className="h-4 w-4 mr-1" />
                                {listing.quantity} units available
                              </p>
                            )}
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
                            </div>                          </div>
                          <div className="text-right">
                            <span className="text-sm text-gray-500 mb-2 block">
                              {new Date(listing.createdAt).toLocaleDateString()}
                            </span>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleDeleteListing(listing.id!, listing.title)}
                                className="btn-outline text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 text-xs px-2 py-1 flex items-center space-x-1"
                                title="Delete listing"
                              >
                                <Trash2 className="h-3 w-3" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>                  </div>
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
          )}{activeTab === 'inquiries-received' && (
            <div className="p-6">              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Inquiries Received</h3>
                <div className="flex space-x-2">                  <span className="text-sm text-gray-600">
                    Count: {inquiries.received.length}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                {inquiries.received.length > 0 ? inquiries.received.map((inquiry) => (
                  <div key={inquiry.id} className="bg-white rounded-lg border border-gray-200 p-6">                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900">{inquiry.fromUserName}</h4>
                        <p className="text-sm text-gray-500">{inquiry.fromUserCompany}</p>
                      </div>
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          inquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          inquiry.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                          inquiry.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {inquiry.status}
                        </span>
                        {inquiry.purchaseStatus === 'purchased' && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Purchased
                          </span>
                        )}
                      </div>
                    </div>                    <p className="text-sm font-medium text-gray-700 mb-2">Re: {inquiry.listingTitle}</p>
                    <p className="text-gray-600 mb-4">{inquiry.message}</p>
                    {inquiry.purchaseStatus === 'purchased' && inquiry.purchaseAmount && (
                      <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                        <p className="text-sm font-medium text-green-800">
                          Item sold for ${inquiry.purchaseAmount.toFixed(2)}
                        </p>
                        {inquiry.purchaseDate && (
                          <p className="text-xs text-green-600 mt-1">
                            Sold on {new Date(inquiry.purchaseDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      {new Date(inquiry.createdAt).toLocaleDateString()}
                    </p>
                    {/* Action buttons */}
                    {inquiry.status === "pending" && (
                      <div className="flex gap-2 mt-4">
                        <button
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                          onClick={() => handleAccept(inquiry.id!)}
                        >
                          Accept
                        </button>
                        <button
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          onClick={() => handleReject(inquiry.id!)}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {/* Chat icon if accepted */}
                    {inquiry.status === "accepted" && (
                      <button
                        className="mt-4 text-blue-600 hover:text-blue-800 flex items-center"
                        onClick={() => handleOpenChat(inquiry)}
                        title="Open Chat"
                      >
                        <MessageSquare className="h-5 w-5 mr-1" />
                        Chat
                      </button>
                    )}
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
                  <div key={inquiry.id} className="bg-white rounded-lg border border-gray-200 p-6">                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900">To: {inquiry.toUserEmail}</h4>
                      </div>
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          inquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          inquiry.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                          inquiry.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {inquiry.status}
                        </span>
                        {inquiry.purchaseStatus === 'purchased' && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Purchased
                          </span>
                        )}
                      </div>
                    </div>                    <p className="text-sm font-medium text-gray-700 mb-2">Re: {inquiry.listingTitle}</p>
                    <p className="text-gray-600 mb-4">{inquiry.message}</p>
                    {inquiry.purchaseStatus === 'purchased' && inquiry.purchaseAmount && (
                      <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                        <p className="text-sm font-medium text-green-800">
                          Purchase completed for ${inquiry.purchaseAmount.toFixed(2)}
                        </p>
                        {inquiry.purchaseDate && (
                          <p className="text-xs text-green-600 mt-1">
                            Purchased on {new Date(inquiry.purchaseDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      {new Date(inquiry.createdAt).toLocaleDateString()}
                    </p>
                    {inquiry.status === "accepted" && (
                      <button
                        className="mt-4 text-blue-600 hover:text-blue-800 flex items-center"
                        onClick={() => handleOpenChat(inquiry)}
                        title="Open Chat"
                      >
                        <MessageSquare className="h-5 w-5 mr-1" />
                        Chat
                      </button>
                    )}
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
          )}{activeTab === 'business' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Business Profile</h3>
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Personal Information Section */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2 text-primary-600" />
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <p className="text-gray-900 bg-white rounded-md px-3 py-2 border">
                        {user?.name || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <p className="text-gray-900 bg-white rounded-md px-3 py-2 border">
                        {user?.email || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>                {/* Business Information Section */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                    <Building className="h-5 w-5 mr-2 text-primary-600" />
                    Business Information
                  </h4>
                  
                  {user?.companyDetails ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                        <p className="text-gray-900 bg-white rounded-md px-3 py-2 border">
                          {user.companyDetails.name}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                        <p className="text-gray-900 bg-white rounded-md px-3 py-2 border">
                          {user.companyDetails.businessType}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <p className="text-gray-900 bg-white rounded-md px-3 py-2 border">
                          {user.companyDetails.email}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telephone</label>
                        <p className="text-gray-900 bg-white rounded-md px-3 py-2 border">
                          {user.companyDetails.telephone}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <p className="text-gray-900 bg-white rounded-md px-3 py-2 border">
                          {user.companyDetails.address}
                        </p>
                      </div>
                      {user.companyDetails.description && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <p className="text-gray-900 bg-white rounded-md px-3 py-2 border">
                            {user.companyDetails.description}
                          </p>
                        </div>
                      )}
                      {user.companyDetails.website && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                          <p className="text-gray-900 bg-white rounded-md px-3 py-2 border">
                            <a 
                              href={user.companyDetails.website.startsWith('http') ? user.companyDetails.website : `https://${user.companyDetails.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-700"
                            >
                              {user.companyDetails.website}
                            </a>
                          </p>
                        </div>
                      )}
                      {user.companyDetails.registrationNumber && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                          <p className="text-gray-900 bg-white rounded-md px-3 py-2 border">
                            {user.companyDetails.registrationNumber}
                          </p>
                        </div>
                      )}
                      {user.companyDetails.operatingSince && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Operating Since</label>
                          <p className="text-gray-900 bg-white rounded-md px-3 py-2 border">
                            {user.companyDetails.operatingSince}
                          </p>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Plan</label>
                        <div className="bg-white rounded-md px-3 py-2 border">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            user?.plan === 'premium' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user?.plan ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1) : 'Free'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h5 className="text-lg font-medium text-gray-900 mb-2">No Business Information</h5>
                      <p className="text-gray-500 mb-4">
                        Complete your business profile to access all features and improve your visibility.
                      </p>
                      <button
                        onClick={() => setShowProfileModal(true)}
                        className="btn-primary"
                      >
                        Add Business Information
                      </button>
                    </div>
                  )}
                </div>

                {/* Account Statistics */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-primary-600" />
                    Account Statistics
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600">{stats.totalListings}</div>
                      <div className="text-sm text-gray-600">Total Listings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats.inquiriesReceived}</div>
                      <div className="text-sm text-gray-600">Inquiries Received</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.inquiriesMade}</div>
                      <div className="text-sm text-gray-600">Inquiries Made</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{stats.profileCompletion}%</div>
                      <div className="text-sm text-gray-600">Profile Complete</div>
                    </div>
                  </div>
                </div>                {/* Profile Completion Tips */}
                {(!user?.companyDetails || stats.profileCompletion < 100) && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                    <h4 className="text-md font-semibold text-amber-900 mb-3 flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2 text-amber-600" />
                      Complete Your Profile
                    </h4>
                    <p className="text-amber-800 mb-4">
                      A complete profile helps you connect better with other businesses and increases your visibility.
                    </p>
                    <ul className="text-sm text-amber-700 space-y-1 mb-4">
                      {!user?.name && <li>• Add your full name</li>}
                      {!user?.companyDetails && <li>• Add your complete business information</li>}
                      {user?.companyDetails && !user?.companyDetails.description && <li>• Add a business description</li>}
                      {user?.companyDetails && !user?.companyDetails.website && <li>• Add your company website</li>}
                      <li>• Create your first listing to showcase your services</li>
                    </ul>                    <button
                      onClick={() => setShowProfileModal(true)}
                      className="btn-primary text-sm"
                    >
                      Complete Profile Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Auctions Tab */}
          {activeTab === 'auctions' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">My Auctions</h3>
                <Link
                  to="/auctions/create"
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Auction</span>
                </Link>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading auctions...</p>
                </div>
              ) : auctions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {auctions.map((auction) => (
                    <div key={auction.id} className="card">
                      <div className="mb-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900 line-clamp-1">{auction.title}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            auction.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {auction.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">{auction.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Starting: {formatPrice(auction.startingPrice.toString())}</span>
                          <span className="font-medium text-primary-600">Current: {formatPrice(auction.currentBid.toString())}</span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Bids:</span>
                          <span className="font-medium">{auction.bids?.length || 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Ends:</span>
                          <span className="font-medium">{new Date(auction.endTime).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Views:</span>
                          <span className="font-medium">{auction.views || 0}</span>
                        </div>
                      </div>                      <div className="flex space-x-2">
                        <Link
                          to={`/auctions/${auction.id}`}
                          className="flex-1 btn-outline text-center text-sm"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => handleDeleteAuction(auction.id!, auction.title)}
                          className="btn-outline text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 text-sm px-3 py-1 flex items-center space-x-1"
                          title="Delete auction"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Gavel className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Auctions Yet</h4>
                  <p className="text-gray-600 mb-6">
                    Create your first auction to sell surplus products through competitive bidding.
                  </p>
                  <Link
                    to="/auctions/create"
                    className="btn-primary"
                  >
                    Create Your First Auction
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Bids Tab */}
          {activeTab === 'bids' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">My Bids</h3>
                <Link
                  to="/auctions"
                  className="btn-outline flex items-center space-x-2"
                >
                  <Gavel className="h-4 w-4" />
                  <span>Browse Auctions</span>
                </Link>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading bids...</p>
                </div>
              ) : userBids.length > 0 ? (
                <div className="space-y-4">
                  {userBids.map((bidItem) => (
                    <div key={`${bidItem.auction.id}-${bidItem.bid.timestamp}`} className="card">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{bidItem.auction.title}</h4>
                          <p className="text-sm text-gray-600 line-clamp-1">{bidItem.auction.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary-600">{formatPrice(bidItem.bid.amount.toString())}</div>
                          <div className="text-xs text-gray-500">Your Bid</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-gray-600">Current High Bid</div>
                          <div className="font-medium">{formatPrice(bidItem.auction.currentBid.toString())}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Your Status</div>
                          <div className={`text-sm font-medium ${
                            bidItem.bid.isWinning ? 'text-green-600' : 'text-orange-600'
                          }`}>
                            {bidItem.bid.isWinning ? 'Winning' : 'Outbid'}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Bid Time</div>
                          <div className="text-sm font-medium">{new Date(bidItem.bid.timestamp).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Auction Ends</div>
                          <div className="text-sm font-medium">{new Date(bidItem.auction.endTime).toLocaleDateString()}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            bidItem.auction.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {bidItem.auction.status}
                          </span>
                          {bidItem.bid.isWinning && (
                            <span className="flex items-center text-sm text-green-600">
                              <Trophy className="h-4 w-4 mr-1" />
                              Leading Bid
                            </span>
                          )}
                        </div>
                        <Link
                          to={`/auctions/${bidItem.auction.id}`}
                          className="btn-outline text-sm"
                        >
                          View Auction
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Bids Yet</h4>
                  <p className="text-gray-600 mb-6">
                    Browse auctions and place your first bid on items you're interested in.
                  </p>
                  <Link
                    to="/auctions"
                    className="btn-primary"
                  >
                    Browse Auctions
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>{/* Profile Completion Modal */}        {showProfileModal && (
          <ProfileCompletionModal
            isOpen={showProfileModal}
            onClose={() => setShowProfileModal(false)}
            required={!!location.state?.requireCompany}
          />
        )}

        {/* Inquiry Chat Modal */}
        {openChatInquiry && user && (
          <InquiryChat
            inquiry={openChatInquiry}
            currentUserId={user.id}
            onClose={() => setOpenChatInquiry(null)}
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MessageSquare, Building2, Star, ArrowLeft, Loader2, RefreshCw, X, Eye, Calendar, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getAllListings, createInquiry, incrementListingViews, Listing } from '../services/firestore';
import { ImageGallery } from '../components/ImageDisplay';

const CatalogPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<'service' | 'product' | ''>('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [showListingModal, setShowListingModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [requestedQuantity, setRequestedQuantity] = useState('');
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

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
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, navigate]);  // Fetch all listings from Firestore
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        console.log('Starting to fetch listings...');
        const fetchedListings = await getAllListings(50); // Fetch up to 50 listings
        console.log('Fetched listings from Firestore:', fetchedListings.length);
        console.log('Listings data:', fetchedListings);
        setListings(fetchedListings);
      } catch (error) {
        console.error('Error fetching listings:', error);
        // Show a user-friendly error message
        alert('Failed to load listings. Please check the console for details.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      console.log('User is authenticated, fetching listings...');
      fetchListings();
    } else {
      console.log('User not authenticated, skipping fetch');
    }
  }, [isAuthenticated]);

  // Set up real-time listener for all listings
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupRealtimeListener = async () => {
      if (!isAuthenticated) return;      try {
        const { onSnapshot, collection, query, where } = await import('firebase/firestore');
        const { db } = await import('../firebase/firebase');

        // Simplified query without orderBy to avoid index requirements
        const q = query(
          collection(db, 'listings'),
          where('status', '==', 'active')
        );

        unsubscribe = onSnapshot(q, (querySnapshot) => {
          const newListings: Listing[] = [];
          querySnapshot.forEach((doc) => {
            newListings.push({ id: doc.id, ...doc.data() } as Listing);
          });
          
          // Sort by createdAt in the frontend
          newListings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          
          console.log('Real-time update: received', newListings.length, 'listings for catalog');
          setListings(newListings);
          setLoading(false);
        }, (error) => {
          console.error('Real-time listener error:', error);
          setLoading(false);
        });
      } catch (error) {
        console.error('Error setting up real-time listener:', error);
        setLoading(false);
      }
    };

    setupRealtimeListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isAuthenticated]);
  const categories = {
    service: [
      'Professional Services',
      'Technical Services',
      'Business Services'
    ],
    product: [
      'Office Supplies',
      'Industrial Equipment',
      'Technology'
    ]
  };

  const subcategories = {
    'Professional Services': ['Consulting', 'Legal', 'Accounting', 'Marketing', 'Design'],
    'Technical Services': ['Web Development', 'IT Support', 'Software Development', 'Digital Marketing'],
    'Business Services': ['Cleaning', 'Security', 'Maintenance', 'Logistics', 'Catering'],
    'Office Supplies': ['Furniture', 'Electronics', 'Stationery', 'Equipment'],
    'Industrial Equipment': ['Machinery', 'Tools', 'Safety Equipment', 'Raw Materials'],
    'Technology': ['Computers', 'Software', 'Networking', 'Mobile Devices']
  };

  const filteredListings = listings.filter(listing => {
    const matchesType = !selectedType || listing.type === selectedType;
    const matchesCategory = !selectedCategory || listing.category.includes(selectedCategory);
    const matchesSubcategory = !selectedSubcategory || listing.category.includes(selectedSubcategory);
    const matchesSearch = !searchTerm || 
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.userCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesCategory && matchesSubcategory && matchesSearch;
  });  const handleInquiry = (listing: Listing) => {
    setSelectedListing(listing);
    setShowInquiryModal(true);
  };

  const handleListingClick = async (listing: Listing) => {
    try {
      // Increment view count
      await incrementListingViews(listing.id!);
      
      // Update local state to reflect the view count change
      setListings(prevListings => 
        prevListings.map(l => 
          l.id === listing.id 
            ? { ...l, views: (l.views || 0) + 1 }
            : l
        )
      );
      
      // Show listing details modal
      setSelectedListing(listing);
      setShowListingModal(true);
    } catch (error) {
      console.error('Error handling listing click:', error);
      // Still show the modal even if view increment fails
      setSelectedListing(listing);
      setShowListingModal(true);
    }
  };
  const submitInquiry = async () => {
    if (!selectedListing || !user || !inquiryMessage.trim()) return;
      // For products, validate quantity
    if (selectedListing.type === 'product') {
      const requestedQty = parseInt(requestedQuantity);
      const availableQty = selectedListing.quantity || 0;
      
      if (!requestedQuantity || requestedQty <= 0) {
        alert('Please specify a valid quantity for this product.');
        return;
      }
      
      if (requestedQty > availableQty) {
        alert(`Requested quantity (${requestedQty}) exceeds available quantity (${availableQty}).`);
        return;
      }
    }
    
    setSubmittingInquiry(true);
    try {
      await createInquiry({
        listingId: selectedListing.id!,
        listingTitle: selectedListing.title,
        listingType: selectedListing.type,
        fromUserId: user.id,
        fromUserEmail: user.email,
        fromUserName: user.name,
        fromUserCompany: user.company || "",
        toUserId: selectedListing.userId,
        toUserEmail: selectedListing.userEmail,
        toUserName: selectedListing.userName,
        toUserCompany: selectedListing.userCompany || "",
        message: inquiryMessage,
        ...(selectedListing.type === 'product' && { 
          requestedQuantity: parseInt(requestedQuantity) 
        }),
        status: "pending",
      });
      
      setShowInquiryModal(false);
      setInquiryMessage('');
      setRequestedQuantity('');
      setSelectedListing(null);
      alert('Inquiry sent successfully!');
    } catch (error) {
      console.error('Error sending inquiry:', error);
      alert('Failed to send inquiry. Please try again.');
    } finally {
      setSubmittingInquiry(false);
    }
  };
  const resetFilters = () => {
    setSelectedType('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSearchTerm('');
  };
  const refreshListings = async () => {
    resetFilters();
    try {
      setLoading(true);
      const fetchedListings = await getAllListings(50);
      console.log('Manual refresh: fetched', fetchedListings.length, 'listings');
      setListings(fetchedListings);
    } catch (error) {
      console.error('Error refreshing listings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </button>            <div className="flex items-center space-x-2">
              <button
                onClick={refreshListings}
                disabled={loading}
                className="btn-outline flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => navigate('/make-listing')}
                className="btn-primary flex items-center space-x-2"
              >
                <Building2 className="h-4 w-4" />
                <span>Create Listing</span>
              </button>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Business Catalog</h1>
          <p className="text-gray-600 mt-2">Discover local businesses offering products and services</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            <button
              onClick={resetFilters}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value as 'service' | 'product' | '');
                  setSelectedCategory('');
                  setSelectedSubcategory('');
                }}
                className="input-field"
              >
                <option value="">All Types</option>
                <option value="service">Services</option>
                <option value="product">Products</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSubcategory('');
                }}
                className="input-field"
                disabled={!selectedType}
              >
                <option value="">All Categories</option>
                {selectedType && categories[selectedType].map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Subcategory Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
              <select
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                className="input-field"
                disabled={!selectedCategory}
              >
                <option value="">All Subcategories</option>
                {selectedCategory && subcategories[selectedCategory as keyof typeof subcategories]?.map(subcategory => (
                  <option key={subcategory} value={subcategory}>{subcategory}</option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Search listings..."
                />
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing {filteredListings.length} results
          </p>
        </div>        {/* Listings Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            <span className="ml-2 text-gray-600">Loading listings...</span>
          </div>
        ) : (          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (              <div key={listing.id} className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleListingClick(listing)}>
                {/* Display actual images or placeholder */}
                <div className="w-full h-48 rounded-lg mb-4 overflow-hidden">
                  {listing.images && listing.images.length > 0 ? (
                    <ImageGallery
                      images={listing.images}
                      alt={listing.title}
                      className="w-full h-full"
                      imageClassName="w-full h-full object-cover"
                      maxImages={1}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                      <div className="text-center">
                        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2 ${
                          listing.type === 'service' ? 'bg-blue-500' : 'bg-green-500'
                        }`}>
                          {listing.type === 'service' ? (
                            <MessageSquare className="h-8 w-8 text-white" />
                          ) : (
                            <Building2 className="h-8 w-8 text-white" />
                          )}
                        </div>
                        <span className="text-sm text-gray-600">{listing.type}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{listing.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    listing.type === 'service' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {listing.type}
                  </span>
                </div>

                <div className="flex items-center space-x-2 mb-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{listing.userCompany}</span>
                </div>

                <div className="flex items-center space-x-2 mb-3">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-700 ml-1">New</span>
                  </div>
                  <span className="text-sm text-gray-500">({listing.views || 0} views)</span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{listing.description}</p>                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-gray-900">{formatPrice(listing.price)}</span>
                    {listing.type === 'product' && listing.quantity && (
                      <div className="text-sm text-green-600 flex items-center mt-1 font-medium">
                        <Package className="h-4 w-4 mr-1" />
                        {listing.quantity} available
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the card click
                      handleInquiry(listing);
                    }}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Inquire</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}        {filteredListings.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              {listings.length === 0 ? (
                <>
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings available</h3>
                  <p className="text-gray-600 mb-4">
                    Be the first to create a listing and connect with other businesses!
                  </p>
                  <button
                    onClick={() => navigate('/make-listing')}
                    className="btn-primary"
                  >
                    Create First Listing
                  </button>
                </>
              ) : (
                <>
                  <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your filters or search terms to find what you're looking for.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="btn-primary"
                  >
                    Clear Filters
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Listing Detail Modal */}
        {showListingModal && selectedListing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Listing Details</h2>
                <button
                  onClick={() => {
                    setShowListingModal(false);
                    setSelectedListing(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Listing Header */}
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedListing.title}</h1>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          selectedListing.type === 'service' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {selectedListing.type}
                        </span>
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 mr-1" />
                          {selectedListing.userCompany}
                        </div>
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {selectedListing.views || 0} views
                        </div>
                      </div>
                    </div>                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary-600 mb-1">{formatPrice(selectedListing.price)}</div>
                      {selectedListing.type === 'product' && selectedListing.quantity && (
                        <div className="text-sm text-gray-600 mb-1">
                          <div className="flex items-center justify-end">
                            <Package className="h-4 w-4 mr-1" />
                            {selectedListing.quantity} available
                          </div>
                        </div>
                      )}
                      <div className="text-sm text-gray-500">
                        <div className="flex items-center justify-end">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(selectedListing.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>                {/* Listing Images */}
                <div className="w-full h-64 rounded-lg mb-6 overflow-hidden">
                  {selectedListing.images && selectedListing.images.length > 0 ? (
                    <ImageGallery
                      images={selectedListing.images}
                      alt={selectedListing.title}
                      className="w-full h-full"
                      imageClassName="w-full h-full object-cover"
                      maxImages={4}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                      <div className="text-center">
                        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-3 ${
                          selectedListing.type === 'service' ? 'bg-blue-500' : 'bg-green-500'
                        }`}>
                          {selectedListing.type === 'service' ? (
                            <MessageSquare className="h-10 w-10 text-white" />
                          ) : (
                            <Building2 className="h-10 w-10 text-white" />
                          )}
                        </div>
                        <span className="text-lg text-gray-600 capitalize">{selectedListing.type}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedListing.description}</p>
                </div>

                {/* Category Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Category</h3>
                  <p className="text-gray-700">{selectedListing.category}</p>
                </div>

                {/* Provider Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Provider Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Company</p>
                        <p className="font-medium text-gray-900">{selectedListing.userCompany}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Contact Person</p>
                        <p className="font-medium text-gray-900">{selectedListing.userName}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      setShowListingModal(false);
                      handleInquiry(selectedListing);
                    }}
                    className="flex-1 btn-primary flex items-center justify-center"
                  >
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Send Inquiry
                  </button>
                  <button
                    onClick={() => {
                      setShowListingModal(false);
                      setSelectedListing(null);
                    }}
                    className="btn-outline px-8"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inquiry Modal */}
        {showInquiryModal && selectedListing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Send Inquiry to {selectedListing.userCompany}
              </h3>
                <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Regarding:</p>
                <p className="font-medium text-gray-900">{selectedListing.title}</p>
              </div>

              {/* Quantity field for products */}
              {selectedListing.type === 'product' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity Required
                  </label>                  <div className="relative">
                    <input
                      type="number"
                      value={requestedQuantity}
                      onChange={(e) => setRequestedQuantity(e.target.value)}
                      className={`input-field pl-10 ${
                        requestedQuantity && (
                          parseInt(requestedQuantity) <= 0 || 
                          parseInt(requestedQuantity) > (selectedListing.quantity || 0)
                        ) ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                      }`}
                      placeholder="Enter quantity needed"
                      min="1"
                      max={selectedListing.quantity || 999999}
                      required
                    />
                    <Package className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                  </div>{selectedListing.quantity && (
                    <div className="mt-1">
                      <p className="text-sm text-gray-500">
                        Available: {selectedListing.quantity} units
                      </p>
                      {requestedQuantity && parseInt(requestedQuantity) > selectedListing.quantity && (
                        <p className="text-sm text-red-600 mt-1">
                          ⚠️ Requested quantity exceeds available stock
                        </p>
                      )}
                      {requestedQuantity && parseInt(requestedQuantity) <= 0 && (
                        <p className="text-sm text-red-600 mt-1">
                          ⚠️ Quantity must be greater than 0
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Message
                </label>
                <textarea
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  rows={4}
                  className="input-field"
                  placeholder="Please provide details about your requirements..."
                  required
                />
              </div><div className="flex space-x-4">                <button
                  onClick={submitInquiry}
                  className="flex-1 btn-primary flex items-center justify-center"                  disabled={
                    !inquiryMessage.trim() ||
                    submittingInquiry ||
                    (selectedListing.type === 'product' && (
                      !requestedQuantity || 
                      parseInt(requestedQuantity) <= 0 ||
                      parseInt(requestedQuantity) > (selectedListing.quantity || 0)
                    ))
                  }
                >
                  {submittingInquiry ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    'Send Inquiry'
                  )}
                </button>                <button
                  onClick={() => {
                    setShowInquiryModal(false);
                    setInquiryMessage('');
                    setRequestedQuantity('');
                    setSelectedListing(null);
                  }}
                  className="btn-outline px-6"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogPage;
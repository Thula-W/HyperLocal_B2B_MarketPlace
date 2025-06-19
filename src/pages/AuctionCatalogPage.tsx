import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Eye, 
  Heart, 
  DollarSign, 
  Package, 
  User, 
  TrendingUp,
  AlertCircle,
  Search,
  Gavel
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getActiveAuctions, AuctionListing, watchAuction, unwatchAuction } from '../services/firestore';

const AuctionCatalogPage: React.FC = () => {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState<AuctionListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [sortBy, setSortBy] = useState<'endTime' | 'currentBid' | 'startingPrice'>('endTime');

  const categories = [
    'Electronics', 'Machinery', 'Office Supplies', 'Raw Materials', 
    'Furniture', 'Vehicles', 'Tools', 'Textiles', 'Food & Beverage', 'Other'
  ];

  const conditions = ['new', 'like-new', 'good', 'fair', 'poor'];
  const reasons = ['surplus', 'overstock', 'discontinued', 'damaged', 'returned', 'other'];

  useEffect(() => {
    loadAuctions();
  }, []);

  const loadAuctions = async () => {
    setLoading(true);
    setError('');
    
    try {
      const activeAuctions = await getActiveAuctions();
      setAuctions(activeAuctions);
    } catch (err) {
      console.error('Error loading auctions:', err);
      setError('Failed to load auctions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWatchToggle = async (auctionId: string, isWatching: boolean) => {
    if (!user) return;
    
    try {
      if (isWatching) {
        await unwatchAuction(auctionId, user.id);
      } else {
        await watchAuction(auctionId, user.id);
      }
      // Refresh auctions to update watch status
      await loadAuctions();
    } catch (err) {
      console.error('Error updating watch status:', err);
    }
  };

  const getTimeRemaining = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const filteredAndSortedAuctions = auctions
    .filter(auction => {
      const matchesSearch = searchTerm === '' || 
        auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        auction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        auction.userCompany.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === '' || auction.category === selectedCategory;
      const matchesCondition = selectedCondition === '' || auction.condition === selectedCondition;
      const matchesReason = selectedReason === '' || auction.reason === selectedReason;
      
      return matchesSearch && matchesCategory && matchesCondition && matchesReason;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'endTime':
          return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
        case 'currentBid':
          return b.currentBid - a.currentBid;
        case 'startingPrice':
          return b.startingPrice - a.startingPrice;
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
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
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <Gavel className="h-8 w-8 mr-3 text-primary-600" />
                Surplus Auctions
              </h1>
              <p className="text-gray-600">
                Discover great deals on surplus products from businesses like yours
              </p>
            </div>
            {user && (
              <Link
                to="/auctions/create"
                className="btn-primary flex items-center space-x-2"
              >
                <Package className="h-5 w-5" />
                <span>List Surplus Items</span>
              </Link>
            )}
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-2xl font-bold text-gray-900">{auctions.length}</p>
                  <p className="text-blue-600">Active Auctions</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-2xl font-bold text-gray-900">
                    {auctions.filter(a => a.bids.length > 0).length}
                  </p>
                  <p className="text-green-600">With Bids</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-2xl font-bold text-gray-900">
                    ${auctions.reduce((sum, a) => sum + a.currentBid, 0).toLocaleString()}
                  </p>
                  <p className="text-purple-600">Total Value</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Search auctions..."
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Condition Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="input-field"
              >
                <option value="">All Conditions</option>
                {conditions.map(condition => (
                  <option key={condition} value={condition}>
                    {condition.charAt(0).toUpperCase() + condition.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Reason Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="input-field"
              >
                <option value="">All Reasons</option>
                {reasons.map(reason => (
                  <option key={reason} value={reason}>
                    {reason.charAt(0).toUpperCase() + reason.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'endTime' | 'currentBid' | 'startingPrice')}
                className="input-field"
              >
                <option value="endTime">Ending Soon</option>
                <option value="currentBid">Highest Bid</option>
                <option value="startingPrice">Starting Price</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-600">{error}</span>
            </div>
          </div>
        )}

        {/* Auction Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedAuctions.length > 0 ? (
            filteredAndSortedAuctions.map((auction) => {
              const timeRemaining = getTimeRemaining(auction.endTime);
              const isWatching = user && auction.watchers?.includes(user.id);
              const isOwner = user?.id === auction.userId;
              const highestBid = auction.bids.find(bid => bid.isWinning);
              
              return (
                <div key={auction.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Image */}
                  <div className="aspect-w-16 aspect-h-12 bg-gray-200">
                    {auction.images && auction.images.length > 0 ? (
                      <img
                        src={auction.images[0]}
                        alt={auction.title}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center">
                        <Package className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                          {auction.title}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <User className="h-4 w-4" />
                          <span>{auction.userCompany}</span>
                        </div>
                      </div>
                      {user && !isOwner && (
                        <button
                          onClick={() => handleWatchToggle(auction.id!, !!isWatching)}
                          className={`p-2 rounded-full transition-colors ${
                            isWatching 
                              ? 'text-red-600 hover:bg-red-50' 
                              : 'text-gray-400 hover:bg-gray-50'
                          }`}
                        >
                          <Heart className={`h-5 w-5 ${isWatching ? 'fill-current' : ''}`} />
                        </button>
                      )}
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        auction.condition === 'new' ? 'bg-green-100 text-green-800' :
                        auction.condition === 'like-new' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {auction.condition.charAt(0).toUpperCase() + auction.condition.slice(1)}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                        {auction.reason.charAt(0).toUpperCase() + auction.reason.slice(1)}
                      </span>
                    </div>

                    {/* Pricing */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Current Bid:</span>
                        <span className="text-lg font-bold text-green-600">
                          ${auction.currentBid.toLocaleString()}
                        </span>
                      </div>
                      {auction.buyNowPrice && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Buy Now:</span>
                          <span className="text-md font-semibold text-blue-600">
                            ${auction.buyNowPrice.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Time and Stats */}
                    <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span className={timeRemaining === 'Ended' ? 'text-red-600' : ''}>
                          {timeRemaining}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-4 w-4" />
                          <span>{auction.bids.length} bids</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{auction.views || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Highest Bidder */}
                    {highestBid && (
                      <div className="text-sm text-gray-600 mb-4">
                        <span className="font-medium">Highest bidder:</span> {highestBid.bidderCompany}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Link
                        to={`/auctions/${auction.id}`}
                        className="flex-1 btn-outline text-center"
                      >
                        View Details
                      </Link>
                      {user && !isOwner && timeRemaining !== 'Ended' && (
                        <Link
                          to={`/auctions/${auction.id}/bid`}
                          className="flex-1 btn-primary text-center"
                        >
                          Place Bid
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <Gavel className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No auctions found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || selectedCategory || selectedCondition || selectedReason
                  ? 'Try adjusting your filters to see more results.'
                  : 'Be the first to list surplus items for auction!'}
              </p>
              {user && (
                <Link to="/auctions/create" className="btn-primary">
                  Create First Auction
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuctionCatalogPage;

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Clock, 
  User, 
  Package, 
  DollarSign, 
  Heart,
  HeartHandshake,
  Gavel,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getAuctionById, 
  placeBid, 
  watchAuction, 
  unwatchAuction,
  AuctionListing
} from '../services/firestore';

const AuctionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [auction, setAuction] = useState<AuctionListing | null>(null);
  const [loading, setLoading] = useState(true);  const [error, setError] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [bidding, setBidding] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const loadAuction = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError('');
    
    try {
      const auctionData = await getAuctionById(id);
      if (auctionData) {
        setAuction(auctionData);
      } else {
        setError('Auction not found');
      }
    } catch (err) {
      console.error('Error loading auction:', err);
      setError('Failed to load auction details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAuction();
  }, [loadAuction]);

  useEffect(() => {
    if (auction && user) {
      setIsWatching(auction.watchers?.includes(user.id) || false);
      // Set minimum bid amount
      const minBid = auction.currentBid ? auction.currentBid + 1 : auction.startingPrice;
      setBidAmount(minBid.toString());
    }
  }, [auction, user]);

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!auction || !user || !id) return;
    
    const amount = Number(bidAmount);
    const minBid = auction.currentBid ? auction.currentBid + 1 : auction.startingPrice;
    
    if (amount < minBid) {
      setError(`Bid must be at least $${minBid}`);
      return;
    }

    setBidding(true);
    setError('');
    
    try {      await placeBid(id, {
        amount,
        bidderId: user.id,
        bidderEmail: user.email,
        bidderName: user.name,
        bidderCompany: user.companyDetails?.name || '',
        timestamp: new Date().toISOString()
      });
      
      // Reload auction to get updated data
      await loadAuction();
      
      // Reset bid amount to new minimum
      const newMinBid = amount + 1;
      setBidAmount(newMinBid.toString());
    } catch (err) {
      console.error('Error placing bid:', err);
      setError('Failed to place bid. Please try again.');
    } finally {
      setBidding(false);
    }
  };

  const handleWatchToggle = async () => {
    if (!auction || !user || !id) return;
    
    try {
      if (isWatching) {
        await unwatchAuction(id, user.id);
        setIsWatching(false);
      } else {
        await watchAuction(id, user.id);
        setIsWatching(true);
      }
    } catch (err) {
      console.error('Error toggling watch:', err);
    }
  };
  const formatTimeRemaining = (endTime: string) => {
    const now = new Date();
    const endDate = new Date(endTime);
    const timeLeft = endDate.getTime() - now.getTime();
    
    if (timeLeft <= 0) {
      return { text: 'Auction ended', isUrgent: true };
    }
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return { text: `${days}d ${hours}h`, isUrgent: days < 1 };
    } else if (hours > 0) {
      return { text: `${hours}h ${minutes}m`, isUrgent: hours < 6 };
    } else {
      return { text: `${minutes}m`, isUrgent: true };
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new': return 'text-green-600 bg-green-50';
      case 'like-new': return 'text-green-500 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'fair': return 'text-yellow-600 bg-yellow-50';
      case 'poor': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error && !auction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => navigate('/auctions')}
            className="mt-4 btn-primary"
          >
            Back to Auctions
          </button>
        </div>
      </div>
    );
  }

  if (!auction) return null;

  const timeRemaining = formatTimeRemaining(auction.endTime);
  const isAuctionEnded = new Date() > new Date(auction.endTime);
  const isOwner = user?.id === auction.userId;
  const minBid = auction.currentBid ? auction.currentBid + 1 : auction.startingPrice;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/auctions')}
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Auctions
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Description */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              {auction.images && auction.images.length > 0 ? (
                <div>
                  <div className="aspect-w-16 aspect-h-9 mb-4">
                    <img
                      src={auction.images[selectedImageIndex]}
                      alt={auction.title}
                      className="w-full h-96 object-cover rounded-lg"
                    />
                  </div>
                  {auction.images.length > 1 && (
                    <div className="flex space-x-2 overflow-x-auto">
                      {auction.images.map((url: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                            index === selectedImageIndex 
                              ? 'border-primary-500' 
                              : 'border-gray-200'
                          }`}
                        >
                          <img
                            src={url}
                            alt={`${auction.title} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Package className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{auction.description}</p>
            </div>

            {/* Seller Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Seller Information</h2>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium">{auction.userName}</p>
                  <p className="text-sm text-gray-500">{auction.userEmail}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Auction Details and Bidding */}
          <div className="space-y-6">
            {/* Main Auction Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{auction.title}</h1>
              
              {/* Status Badge */}
              <div className="flex items-center space-x-2 mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isAuctionEnded 
                    ? 'bg-gray-100 text-gray-600' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {isAuctionEnded ? 'Ended' : 'Active'}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(auction.condition)}`}>
                  {auction.condition.charAt(0).toUpperCase() + auction.condition.slice(1)}
                </span>
              </div>

              {/* Time Remaining */}
              <div className="flex items-center space-x-2 mb-4">
                <Clock className={`h-5 w-5 ${timeRemaining.isUrgent ? 'text-red-500' : 'text-gray-500'}`} />
                <span className={`font-medium ${timeRemaining.isUrgent ? 'text-red-600' : 'text-gray-700'}`}>
                  {timeRemaining.text}
                </span>
              </div>

              {/* Current Bid */}
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">Current Bid</p>
                <p className="text-3xl font-bold text-green-600">
                  ${auction.currentBid || auction.startingPrice}
                </p>
                {auction.bids && auction.bids.length > 0 && (
                  <p className="text-sm text-gray-500">
                    {auction.bids.length} bid{auction.bids.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {/* Watch Button */}
              <button
                onClick={handleWatchToggle}
                className={`flex items-center space-x-2 w-full mb-4 px-4 py-2 rounded-lg border transition-colors ${
                  isWatching
                    ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {isWatching ? (
                  <HeartHandshake className="h-5 w-5" />
                ) : (
                  <Heart className="h-5 w-5" />
                )}
                <span>{isWatching ? 'Watching' : 'Watch'}</span>
              </button>

              {/* Bidding Form */}
              {!isAuctionEnded && !isOwner && (
                <form onSubmit={handlePlaceBid} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Bid (minimum ${minBid})
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        min={minBid}
                        step="1"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  
                  {error && (
                    <div className="flex items-center space-x-2 text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={bidding}
                    className="w-full btn-primary flex items-center justify-center space-x-2"
                  >
                    <Gavel className="h-5 w-5" />
                    <span>{bidding ? 'Placing Bid...' : 'Place Bid'}</span>
                  </button>
                </form>
              )}

              {/* Buy Now Option */}
              {auction.buyNowPrice && !isAuctionEnded && !isOwner && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors">
                    Buy Now for ${auction.buyNowPrice}
                  </button>
                </div>
              )}

              {isOwner && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 text-sm">This is your auction listing.</p>
                </div>
              )}
            </div>

            {/* Auction Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Auction Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Category:</span>
                  <span>{auction.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Quantity:</span>
                  <span>{auction.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Starting Price:</span>
                  <span>${auction.startingPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Reason:</span>
                  <span className="capitalize">{auction.reason}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Watchers:</span>
                  <span>{auction.watchers?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Started:</span>
                  <span>{new Date(auction.startTime).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ends:</span>
                  <span>{new Date(auction.endTime).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Recent Bids */}
            {auction.bids && auction.bids.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Bids</h3>
                <div className="space-y-3">
                  {auction.bids
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .slice(0, 5)
                    .map((bid, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">${bid.amount}</p>                          <p className="text-xs text-gray-500">
                            {new Date(bid.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600">
                          {bid.bidderName}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetailPage;

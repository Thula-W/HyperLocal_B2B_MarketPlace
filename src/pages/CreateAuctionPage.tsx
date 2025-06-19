import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, DollarSign, AlertCircle, Plus, X, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createAuctionListing, AuctionListing } from '../services/firestore';
import { uploadImageToCloudinary } from '../services/cloudinary';

const CreateAuctionPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: 'good' as const,
    reason: 'surplus' as const,
    quantity: 1,
    startingPrice: 0,
    buyNowPrice: '',
    auctionDuration: 7, // days
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Electronics', 'Machinery', 'Office Supplies', 'Raw Materials', 
    'Furniture', 'Vehicles', 'Tools', 'Textiles', 'Food & Beverage', 'Other'
  ];

  const conditions = [
    { value: 'new', label: 'New - Unused, in original packaging' },
    { value: 'like-new', label: 'Like New - Minimal use, excellent condition' },
    { value: 'good', label: 'Good - Normal wear, fully functional' },
    { value: 'fair', label: 'Fair - Noticeable wear, some cosmetic issues' },
    { value: 'poor', label: 'Poor - Heavy wear, may need repairs' },
  ];

  const reasons = [
    { value: 'surplus', label: 'Surplus Inventory' },
    { value: 'overstock', label: 'Overstock' },
    { value: 'discontinued', label: 'Discontinued Product' },
    { value: 'damaged', label: 'Damaged Packaging' },
    { value: 'returned', label: 'Customer Returns' },
    { value: 'other', label: 'Other' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'startingPrice' || name === 'auctionDuration' 
        ? Number(value) 
        : value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }
    
    setImages(prev => [...prev, ...files]);
    
    // Create preview URLs
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      setImageUrls(prev => [...prev, url]);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.companyDetails) {
      setError('Please complete your business profile before creating auctions.');
      return;
    }

    if (!formData.title.trim() || !formData.description.trim() || !formData.category) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.startingPrice <= 0) {
      setError('Starting price must be greater than 0.');
      return;
    }

    setLoading(true);
    setError('');

    try {      // Upload images to Cloudinary
      const uploadedImageUrls: string[] = [];
      for (const image of images) {
        const url = await uploadImageToCloudinary(image);
        uploadedImageUrls.push(url);
      }

      // Calculate auction end time
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + formData.auctionDuration * 24 * 60 * 60 * 1000);

      const auctionData: Omit<AuctionListing, 'id' | 'createdAt' | 'updatedAt' | 'currentBid' | 'bids'> = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: 'product',
        startingPrice: formData.startingPrice,
        buyNowPrice: formData.buyNowPrice ? Number(formData.buyNowPrice) : undefined,
        category: formData.category,
        quantity: formData.quantity,
        condition: formData.condition,
        reason: formData.reason,
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        userCompany: user.companyDetails.name,
        status: 'active',
        images: uploadedImageUrls,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        views: 0,
        watchers: [],
      };

      const auctionId = await createAuctionListing(auctionData);
      
      // Navigate to the auction page
      navigate(`/auctions/${auctionId}`, { 
        state: { 
          message: 'Auction created successfully! Your surplus items are now live for bidding.' 
        }
      });
    } catch (err) {
      console.error('Error creating auction:', err);
      setError('Failed to create auction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">
              Please sign in to create auction listings.
            </p>
            <button
              onClick={() => navigate('/signin')}
              className="btn-primary"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <Package className="h-8 w-8 mr-3 text-primary-600" />
            List Surplus Items for Auction
          </h1>
          <p className="text-gray-600">
            Turn your excess inventory into revenue through competitive bidding
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., Industrial Printer - Canon ImageRunner"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="input-field"
                  placeholder="Detailed description of the item, including specifications, usage history, and any defects..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  className="input-field"
                  required
                />
              </div>
            </div>
          </div>

          {/* Condition and Reason */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Item Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition <span className="text-red-500">*</span>
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  {conditions.map(condition => (
                    <option key={condition.value} value={condition.value}>
                      {condition.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Sale <span className="text-red-500">*</span>
                </label>
                <select
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  {reasons.map(reason => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <DollarSign className="h-6 w-6 mr-2 text-green-600" />
              Pricing
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Starting Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                  <input
                    type="number"
                    name="startingPrice"
                    value={formData.startingPrice}
                    onChange={handleInputChange}
                    min="1"
                    step="0.01"
                    className="input-field pl-8"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buy Now Price (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                  <input
                    type="number"
                    name="buyNowPrice"
                    value={formData.buyNowPrice}
                    onChange={handleInputChange}
                    step="0.01"
                    className="input-field pl-8"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Allow immediate purchase at this price
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auction Duration <span className="text-red-500">*</span>
                </label>
                <select
                  name="auctionDuration"
                  value={formData.auctionDuration}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value={1}>1 Day</option>
                  <option value={3}>3 Days</option>
                  <option value={7}>7 Days</option>
                  <option value={10}>10 Days</option>
                  <option value={14}>14 Days</option>
                </select>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Images</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Images (Maximum 5)
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 10MB each)</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={images.length >= 5}
                    />
                  </label>
                </div>
              </div>

              {/* Image Previews */}
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-red-600">{error}</span>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => navigate('/auctions')}
              className="btn-outline"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  <span>Create Auction</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAuctionPage;

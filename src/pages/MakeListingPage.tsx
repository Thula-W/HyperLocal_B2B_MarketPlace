import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Tag, FileText, CheckCircle, AlertCircle, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createListing } from '../services/firestore';
import ImageUpload from '../components/ImageUpload';

const MakeListingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();  const [formData, setFormData] = useState({
    type: '',
    category: '',
    subcategory: '',
    title: '',
    price: '',
    quantity: '', // Quantity for products
    description: '',
    images: [] as string[] // Changed to store Cloudinary URLs
  });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = {
    service: [
      {
        name: 'Professional Services',
        subcategories: ['Consulting', 'Legal', 'Accounting', 'Marketing', 'Design']
      },
      {
        name: 'Technical Services',
        subcategories: ['Web Development', 'IT Support', 'Software Development', 'Digital Marketing']
      },
      {
        name: 'Business Services',
        subcategories: ['Cleaning', 'Security', 'Maintenance', 'Logistics', 'Catering']
      }
    ],
    product: [
      {
        name: 'Office Supplies',
        subcategories: ['Furniture', 'Electronics', 'Stationery', 'Equipment']
      },
      {
        name: 'Industrial Equipment',
        subcategories: ['Machinery', 'Tools', 'Safety Equipment', 'Raw Materials']
      },
      {
        name: 'Technology',
        subcategories: ['Computers', 'Software', 'Networking', 'Mobile Devices']
      }
    ]
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset subcategory when category changes
      ...(name === 'category' ? { subcategory: '' } : {})
    }));
  };
  const handleImageUpload = (imageUrls: string[]) => {
    setFormData(prev => ({
      ...prev,
      images: imageUrls
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!user) {
      setError('You must be logged in to create a listing');
      return;
    }

    setLoading(true);    try {      const listingData = {
        title: formData.title,
        description: formData.description,
        type: formData.type as 'product' | 'service',
        price: formData.price,
        category: `${formData.category} - ${formData.subcategory}`,
        ...(formData.type === 'product' && formData.quantity && { 
          quantity: parseInt(formData.quantity) 
        }), // Include quantity only for products
        images: formData.images, // Include Cloudinary URLs
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        userCompany: user.company,
        status: 'active' as const
      };
      
      console.log('📝 Creating listing with data:', listingData);
      console.log('🖼️ Images being saved:', formData.images);
      
      await createListing(listingData);
      console.log('Listing created successfully');
      setSuccess(true);
      
      // Navigate after a shorter delay to reduce waiting time
      setTimeout(() => {
        console.log('Navigating to profile with refresh flag');
        navigate('/profile', { state: { refresh: true }, replace: true });
      }, 1500);
    } catch (err) {
      console.error('Error creating listing:', err);
      setError('Failed to create listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center max-w-md">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Listing Created Successfully!</h2>
          <p className="text-gray-600 mb-4">Your listing is now live and visible to other businesses.</p>
          <p className="text-sm text-gray-500">Redirecting to your profile...</p>
        </div>
      </div>
    );
  }

  const selectedCategories = formData.type ? categories[formData.type as keyof typeof categories] : [];
  const selectedSubcategories = selectedCategories.find(cat => cat.name === formData.category)?.subcategories || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Create New Listing</h1>
            <p className="text-gray-600 mt-2">Share your products or services with local businesses</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-sm text-red-600">{error}</span>
              </div>
            )}

            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What are you listing?
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'service', category: '', subcategory: '' }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.type === 'service'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-center">
                    <FileText className="h-8 w-8 mx-auto mb-2" />
                    <span className="font-medium">Service</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'product', category: '', subcategory: '' }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.type === 'product'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-center">
                    <Tag className="h-8 w-8 mx-auto mb-2" />
                    <span className="font-medium">Product</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Category Selection */}
            {formData.type && (
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">Select a category</option>
                  {selectedCategories.map((category) => (
                    <option key={category.name} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Subcategory Selection */}
            {formData.category && (
              <div>
                <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategory
                </label>
                <select
                  id="subcategory"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">Select a subcategory</option>
                  {selectedSubcategories.map((subcategory) => (
                    <option key={subcategory} value={subcategory}>
                      {subcategory}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Enter a descriptive title"
                required
              />
            </div>            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Price
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="input-field pl-10"
                  placeholder="e.g., $50/hour, $100/unit, Contact for quote"
                  required
                />
                <DollarSign className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Quantity - Only for products */}
            {formData.type === 'product' && (
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity Available
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="input-field pl-10"
                    placeholder="e.g., 100"
                    min="1"
                    required
                  />
                  <Package className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  How many units do you have available for sale?
                </p>
              </div>
            )}

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="input-field"
                placeholder="Provide detailed information about your product or service"
                required
              />
            </div>            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images (Optional)
              </label>
              <ImageUpload
                onImageUpload={handleImageUpload}
                currentImages={formData.images}
                maxImages={5}
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4">              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Listing...' : 'Create Listing'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="btn-outline py-3 px-6 text-base"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MakeListingPage;
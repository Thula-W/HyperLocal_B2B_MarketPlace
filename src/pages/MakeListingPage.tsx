import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, DollarSign, Tag, FileText, CheckCircle } from 'lucide-react';

const MakeListingPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: '',
    category: '',
    subcategory: '',
    title: '',
    price: '',
    description: '',
    images: [] as File[]
  });
  const [success, setSuccess] = useState(false);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files].slice(0, 5) // Limit to 5 images
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock submission
    setSuccess(true);
    setTimeout(() => {
      navigate('/profile');
    }, 2000);
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Create New Listing</h1>
            <p className="text-gray-600 mt-2">Share your products or services with local businesses</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
            </div>

            {/* Price */}
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
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">Upload up to 5 images</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="btn-outline cursor-pointer"
                >
                  Choose Files
                </label>
              </div>
              
              {formData.images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {formData.images.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 btn-primary py-3 text-base"
              >
                Create Listing
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
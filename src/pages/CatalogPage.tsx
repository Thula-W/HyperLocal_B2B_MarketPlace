import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MessageSquare, Building2, Star, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Listing {
  id: number;
  title: string;
  price: string;
  company: string;
  type: 'service' | 'product';
  category: string;
  subcategory: string;
  rating: number;
  reviews: number;
  description: string;
  image: string;
}

const CatalogPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<'service' | 'product' | ''>('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [inquiryMessage, setInquiryMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, navigate]);

  // Mock data
  const mockListings: Listing[] = [
    {
      id: 1,
      title: 'Professional Web Design Services',
      price: '$150/hour',
      company: 'DesignPro Studio',
      type: 'service',
      category: 'Professional Services',
      subcategory: 'Design',
      rating: 4.8,
      reviews: 24,
      description: 'Custom web design and development for businesses of all sizes.',
      image: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 2,
      title: 'Office Cleaning Services',
      price: '$80/visit',
      company: 'CleanPro Solutions',
      type: 'service',
      category: 'Business Services',
      subcategory: 'Cleaning',
      rating: 4.9,
      reviews: 156,
      description: 'Comprehensive office cleaning services for professional environments.',
      image: 'https://images.pexels.com/photos/4108715/pexels-photo-4108715.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 3,
      title: 'Industrial Printer Paper - Bulk',
      price: '$45/case',
      company: 'OfficePlus Supply',
      type: 'product',
      category: 'Office Supplies',
      subcategory: 'Stationery',
      rating: 4.6,
      reviews: 89,
      description: 'High-quality printer paper perfect for high-volume printing needs.',
      image: 'https://images.pexels.com/photos/4226876/pexels-photo-4226876.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 4,
      title: 'Business Consulting Services',
      price: '$200/hour',
      company: 'Strategic Solutions Inc',
      type: 'service',
      category: 'Professional Services',
      subcategory: 'Consulting',
      rating: 4.7,
      reviews: 43,
      description: 'Strategic business consulting to help your company grow and optimize operations.',
      image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 5,
      title: 'Commercial Security System',
      price: '$2,500/unit',
      company: 'SecureGuard Tech',
      type: 'product',
      category: 'Industrial Equipment',
      subcategory: 'Safety Equipment',
      rating: 4.8,
      reviews: 67,
      description: 'State-of-the-art security system with 24/7 monitoring capabilities.',
      image: 'https://images.pexels.com/photos/430205/pexels-photo-430205.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 6,
      title: 'IT Support & Maintenance',
      price: '$120/hour',
      company: 'TechSupport Pro',
      type: 'service',
      category: 'Technical Services',
      subcategory: 'IT Support',
      rating: 4.9,
      reviews: 234,
      description: 'Comprehensive IT support and maintenance for small to medium businesses.',
      image: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

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

  const filteredListings = mockListings.filter(listing => {
    const matchesType = !selectedType || listing.type === selectedType;
    const matchesCategory = !selectedCategory || listing.category === selectedCategory;
    const matchesSubcategory = !selectedSubcategory || listing.subcategory === selectedSubcategory;
    const matchesSearch = !searchTerm || 
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesCategory && matchesSubcategory && matchesSearch;
  });

  const handleInquiry = (listing: Listing) => {
    setSelectedListing(listing);
    setShowInquiryModal(true);
  };

  const submitInquiry = () => {
    // Mock inquiry submission
    console.log('Inquiry submitted:', {
      listing: selectedListing,
      message: inquiryMessage
    });
    setShowInquiryModal(false);
    setInquiryMessage('');
    setSelectedListing(null);
    alert('Inquiry sent successfully!');
  };

  const resetFilters = () => {
    setSelectedType('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </button>
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
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <div key={listing.id} className="card hover:shadow-lg transition-shadow">
              <img
                src={listing.image}
                alt={listing.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              
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
                <span className="text-sm text-gray-600">{listing.company}</span>
              </div>

              <div className="flex items-center space-x-2 mb-3">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-gray-700 ml-1">{listing.rating}</span>
                </div>
                <span className="text-sm text-gray-500">({listing.reviews} reviews)</span>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{listing.description}</p>

              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">{listing.price}</span>
                <button
                  onClick={() => handleInquiry(listing)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Inquire</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredListings.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
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
            </div>
          </div>
        )}

        {/* Inquiry Modal */}
        {showInquiryModal && selectedListing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Send Inquiry to {selectedListing.company}
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Regarding:</p>
                <p className="font-medium text-gray-900">{selectedListing.title}</p>
              </div>

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
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={submitInquiry}
                  className="flex-1 btn-primary"
                  disabled={!inquiryMessage.trim()}
                >
                  Send Inquiry
                </button>
                <button
                  onClick={() => {
                    setShowInquiryModal(false);
                    setInquiryMessage('');
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
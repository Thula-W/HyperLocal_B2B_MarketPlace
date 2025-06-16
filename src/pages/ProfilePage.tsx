import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Package, 
  MessageSquare, 
  Plus, 
  TrendingUp, 
  Eye,
  Mail,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const stats = {
    totalListings: 12,
    totalInquiries: 28,
    inquiriesReceived: 18,
    inquiriesMade: 10,
    profileCompletion: 85
  };

  const myListings = [
    {
      id: 1,
      title: 'Professional Web Design Services',
      type: 'service',
      price: '$150/hour',
      status: 'active',
      inquiries: 5,
      views: 45
    },
    {
      id: 2,
      title: 'Office Cleaning Supplies',
      type: 'product',
      price: '$25/unit',
      status: 'active',
      inquiries: 3,
      views: 23
    }
  ];

  const inquiriesReceived = [
    {
      id: 1,
      from: 'Tech Startup Co.',
      listing: 'Professional Web Design Services',
      message: 'We need a complete website redesign for our startup...',
      date: '2024-01-15',
      status: 'new'
    },
    {
      id: 2,
      from: 'Local Restaurant',
      listing: 'Office Cleaning Supplies',
      message: 'Looking for bulk cleaning supplies for our restaurant...',
      date: '2024-01-14',
      status: 'replied'
    }
  ];

  const inquiriesMade = [
    {
      id: 1,
      to: 'PrintPro Services',
      listing: 'Business Card Printing',
      message: 'Need 1000 business cards with premium finish...',
      date: '2024-01-13',
      status: 'pending'
    }
  ];

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
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-primary-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-primary-600">Total Listings</p>
                        <p className="text-2xl font-bold text-primary-900">{stats.totalListings}</p>
                      </div>
                      <Package className="h-8 w-8 text-primary-600" />
                    </div>
                  </div>
                  
                  <div className="bg-secondary-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-secondary-600">Total Inquiries</p>
                        <p className="text-2xl font-bold text-secondary-900">{stats.totalInquiries}</p>
                      </div>
                      <MessageSquare className="h-8 w-8 text-secondary-600" />
                    </div>
                  </div>
                  
                  <div className="bg-accent-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-accent-600">Inquiries Received</p>
                        <p className="text-2xl font-bold text-accent-900">{stats.inquiriesReceived}</p>
                      </div>
                      <Mail className="h-8 w-8 text-accent-600" />
                    </div>
                  </div>
                  
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Plan</p>
                        <p className="text-2xl font-bold text-gray-900 capitalize">{user?.plan}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-gray-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg p-6 text-white">
                  <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
                  <div className="flex flex-wrap gap-4">
                    <Link
                      to="/make-listing"
                      className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add New Listing</span>
                    </Link>
                    <Link
                      to="/catalog"
                      className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Browse Catalog</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* My Listings Tab */}
            {activeTab === 'listings' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">My Listings</h3>
                  <Link to="/make-listing" className="btn-primary flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Add New Listing</span>
                  </Link>
                </div>
                
                <div className="grid gap-6">
                  {myListings.map((listing) => (
                    <div key={listing.id} className="card">
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
                          <p className="text-gray-600 mb-4">{listing.price}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center space-x-1">
                              <MessageSquare className="h-4 w-4" />
                              <span>{listing.inquiries} inquiries</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Eye className="h-4 w-4" />
                              <span>{listing.views} views</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
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
                  ))}
                </div>
              </div>
            )}

            {/* Inquiries Received Tab */}
            {activeTab === 'inquiries-received' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Inquiries Received</h3>
                <div className="grid gap-6">
                  {inquiriesReceived.map((inquiry) => (
                    <div key={inquiry.id} className="card">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{inquiry.from}</h4>
                          <p className="text-sm text-gray-600">Re: {inquiry.listing}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            inquiry.status === 'new' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {inquiry.status}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(inquiry.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-4">{inquiry.message}</p>
                      <div className="flex space-x-2">
                        <button className="btn-primary text-sm">Reply</button>
                        <button className="btn-outline text-sm">Mark as Read</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inquiries Made Tab */}
            {activeTab === 'inquiries-made' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Inquiries Made</h3>
                <div className="grid gap-6">
                  {inquiriesMade.map((inquiry) => (
                    <div key={inquiry.id} className="card">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">To: {inquiry.to}</h4>
                          <p className="text-sm text-gray-600">Re: {inquiry.listing}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            inquiry.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {inquiry.status}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(inquiry.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700">{inquiry.message}</p>
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

export default ProfilePage;
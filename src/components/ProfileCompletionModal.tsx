import React, { useState, useEffect } from 'react';
import { Building, User, AlertCircle, CheckCircle, Mail, Phone, MapPin, Globe, Calendar, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ProfileCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  required?: boolean; // New prop to make completion mandatory
}

const ProfileCompletionModal: React.FC<ProfileCompletionModalProps> = ({ isOpen, onClose, required = false }) => {
  const { updateProfile, createOrUpdateCompany, user } = useAuth();
  const [formData, setFormData] = useState({
    // Personal Information
    name: user?.name || '',
    // Company Information
    companyName: user?.company || '',
    companyEmail: '',
    telephone: '',
    address: '',
    description: '',
    businessType: '',
    registrationNumber: '',
    operatingSince: '',
    website: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const businessTypes = [
    'Sole Proprietor',
    'Partnership',
    'Pvt Ltd',
    'LLC',
    'Public Ltd',
    'Non-Profit',
    'Other'
  ];

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        companyName: user.company || '',
        companyEmail: '',
        telephone: '',
        address: '',
        description: '',
        businessType: '',
        registrationNumber: '',
        operatingSince: '',
        website: ''
      });
    }
  }, [user]);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    
    // Validate required company fields
    if (required || formData.companyName.trim()) {
      if (!formData.companyName.trim()) {
        setError('Company name is required');
        return;
      }
      if (!formData.companyEmail.trim()) {
        setError('Company email is required');
        return;
      }
      if (!formData.telephone.trim()) {
        setError('Phone number is required');
        return;
      }
      if (!formData.address.trim()) {
        setError('Address is required');
        return;
      }
      if (!formData.businessType.trim()) {
        setError('Business type is required');
        return;
      }
    }
    
    setError('');
    setLoading(true);    try {
      // First, update the user's personal information
      await updateProfile({ name: formData.name.trim() });
      
      // If company information is provided, create/update company
      if (formData.companyName.trim()) {
        await createOrUpdateCompany({
          name: formData.companyName.trim(),
          email: formData.companyEmail.trim(),
          telephone: formData.telephone.trim(),
          address: formData.address.trim(),
          description: formData.description.trim() || undefined,
          businessType: formData.businessType.trim(),
          registrationNumber: formData.registrationNumber.trim() || undefined,
          operatingSince: formData.operatingSince || undefined,
          website: formData.website.trim() || undefined,
        });
      }
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (!required) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-6 border w-full max-w-4xl shadow-lg rounded-md bg-white max-h-screen overflow-y-auto">
        <div className="mt-3">
          {success ? (
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Profile Updated Successfully!
              </h3>
              <p className="text-gray-600">Your profile information has been saved.</p>
            </div>
          ) : (
            <>              <div className="text-center">
                <User className="h-12 w-12 text-primary-600 mx-auto mb-4" />                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {required 
                    ? 'Business Information Required' 
                    : (user?.company ? 'Edit Profile' : 'Complete Your Profile')
                  }
                </h3>
                <p className="text-gray-600 mb-6">
                  {required 
                    ? 'Please provide your information to continue using the platform.'
                    : user?.company 
                      ? 'Update your personal and business information.'
                      : 'Help other businesses find you by adding your information.'
                  }
                </p>
              </div>              <form onSubmit={handleSubmit} className="space-y-6 max-h-96 overflow-y-auto">
                {error && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4 flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                    <span className="text-sm text-red-600">{error}</span>
                  </div>
                )}

                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-900 border-b pb-2">Personal Information</h4>
                  
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="input-field pl-10"
                        placeholder="Enter your full name"
                        required
                      />
                      <User className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                    </div>
                  </div>
                </div>

                {/* Company Information */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-900 border-b pb-2">
                    Company Information {required && <span className="text-red-500">*</span>}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name {required && <span className="text-red-500">*</span>}
                      </label>
                      <div className="relative">
                        <input
                          id="companyName"
                          name="companyName"
                          type="text"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          className="input-field pl-10"
                          placeholder="Enter company name"
                          required={required}
                        />
                        <Building className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="companyEmail" className="block text-sm font-medium text-gray-700 mb-2">
                        Company Email {required && <span className="text-red-500">*</span>}
                      </label>
                      <div className="relative">
                        <input
                          id="companyEmail"
                          name="companyEmail"
                          type="email"
                          value={formData.companyEmail}
                          onChange={handleInputChange}
                          className="input-field pl-10"
                          placeholder="company@example.com"
                          required={required}
                        />
                        <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number {required && <span className="text-red-500">*</span>}
                      </label>
                      <div className="relative">
                        <input
                          id="telephone"
                          name="telephone"
                          type="tel"
                          value={formData.telephone}
                          onChange={handleInputChange}
                          className="input-field pl-10"
                          placeholder="+1 (555) 123-4567"
                          required={required}
                        />
                        <Phone className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-2">
                        Business Type {required && <span className="text-red-500">*</span>}
                      </label>                      <select
                        id="businessType"
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleInputChange}
                        className="input-field"
                        required={required}
                      >
                        <option value="">Select business type</option>
                        {businessTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                      Business Address {required && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">                      <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="input-field pl-10 h-20 resize-none"
                        placeholder="Enter complete business address"
                        required={required}
                      />
                      <MapPin className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Company Description
                    </label>
                    <div className="relative">                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="input-field pl-10 h-20 resize-none"
                        placeholder="Brief description of your company and services"
                      />
                      <FileText className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                        Website
                      </label>
                      <div className="relative">
                        <input
                          id="website"
                          name="website"
                          type="url"
                          value={formData.website}
                          onChange={handleInputChange}
                          className="input-field pl-10"
                          placeholder="https://www.example.com"
                        />
                        <Globe className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="operatingSince" className="block text-sm font-medium text-gray-700 mb-2">
                        Operating Since
                      </label>
                      <div className="relative">
                        <input
                          id="operatingSince"
                          name="operatingSince"
                          type="date"
                          value={formData.operatingSince}
                          onChange={handleInputChange}
                          className="input-field pl-10"
                        />
                        <Calendar className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      Business Registration Number
                    </label>
                    <input
                      id="registrationNumber"
                      name="registrationNumber"
                      type="text"
                      value={formData.registrationNumber}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Enter business registration number"
                    />
                  </div>
                </div>

                <div className={`flex ${required ? 'justify-center' : 'space-x-3'} pt-4 border-t`}>
                  <button
                    type="submit"
                    disabled={loading || !formData.name.trim() || (required && !formData.companyName.trim())}
                    className={`${required ? 'w-full' : 'flex-1'} btn-primary py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading ? 'Saving...' : (required ? 'Complete Profile' : 'Update Profile')}
                  </button>
                  {!required && (
                    <button
                      type="button"
                      onClick={handleSkip}
                      disabled={loading}
                      className="flex-1 btn-outline py-2 text-sm"
                    >
                      Skip for now
                    </button>
                  )}
                </div>

                {required && (
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mt-4">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-amber-400 mr-2" />
                      <p className="text-sm text-amber-700">                        Complete business information is required to access platform features.
                      </p>
                    </div>
                  </div>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionModal;

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { addCompany } from '../services/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Upload, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const BUSINESS_TYPES = [
  'Sole Proprietor',
  'Partnership',
  'Pvt Ltd',
  'LLC',
  'Public Ltd',
  'Non-Profit',
  'Other'
];

const RegisterCompanyPage: React.FC = () => {  const location = useLocation();
  const navigate = useNavigate();
  const { updateProfile, isAuthenticated } = useAuth();
  const { companyName } = location.state || {};

  // Redirect to register if user is not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/register');
    }
  }, [isAuthenticated, navigate]);

  const [form, setForm] = useState({
    name: companyName || '',
    email: '',
    telephone: '',
    address: '',
    description: '',
    logo: null as File | null,
    businessType: '',
    registrationNumber: '',
    operatingSince: '',
    website: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Handles all non-file input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handles logo file input and preview
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm(prev => ({
        ...prev,
        logo: file,
      }));
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveLogo = () => {
    setForm(prev => ({
      ...prev,
      logo: null,
    }));
    setLogoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let logoUrl = '';
      if (form.logo) {
        const storage = getStorage();
        const storageRef = ref(storage, `company_logos/${Date.now()}_${form.logo.name}`);
        await uploadBytes(storageRef, form.logo);
        logoUrl = await getDownloadURL(storageRef);      }

      await addCompany({
        name: form.name,
        email: form.email,
        telephone: form.telephone,
        address: form.address,
        description: form.description === '' ? undefined : form.description,
        logoUrl,
        businessType: form.businessType,
        registrationNumber: form.registrationNumber || undefined,
        operatingSince: form.operatingSince || undefined,
        website: form.website || undefined,      });

      // Update the user's profile to associate the company
      await updateProfile({ company: form.name });

      navigate('/profile');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError('Failed to register company. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Register Your Business with HyperLocal</h2>
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4 flex items-center">
              <span className="text-sm text-red-600">{error}</span>
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Two-column grid for first fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  value={form.name}
                  disabled
                  className="input-field w-full bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="businessType"
                  value={form.businessType}
                  onChange={handleInputChange}
                  required
                  className="input-field w-full"
                >
                  <option value="">Select type</option>
                  {BUSINESS_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Operating Since <span className="text-red-500">*</span>
                </label>
                <input
                  name="operatingSince"
                  value={form.operatingSince}
                  onChange={handleInputChange}
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  required
                  className="input-field w-full"
                  placeholder="Year (e.g. 2015)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Email <span className="text-red-500">*</span>
                </label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                  required
                  className="input-field w-full"
                  placeholder="Enter Business email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telephone <span className="text-red-500">*</span>
                </label>
                <input
                  name="telephone"
                  value={form.telephone}
                  onChange={handleInputChange}
                  required
                  className="input-field w-full"
                  placeholder="Enter telephone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Registration Number
                </label>
                <input
                  name="registrationNumber"
                  value={form.registrationNumber}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  placeholder="Enter registration number"
                />
              </div>
            </div>
            {/* Single column for the rest */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleInputChange}
                  required
                  className="input-field w-full"
                  placeholder="Enter address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  required
                  placeholder="Provide a brief description about your Business"
                  className="input-field w-full resize-none"
                  rows={3}
                  style={{ minHeight: '96px' }} // 3x typical input height
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  name="website"
                  value={form.website}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  placeholder="https://yourcompany.com"
                  type="url"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Logo
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center relative">
                  {!logoPreview ? (
                    <>
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Upload your company logo</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        className="btn-outline cursor-pointer"
                      >
                        Choose Image
                      </label>
                    </>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="relative inline-block">
                        <img
                          src={logoPreview}
                          alt="Logo Preview"
                          className="h-16 w-16 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="absolute -top-2 -right-2 bg-white rounded-full border border-gray-300 p-1 shadow hover:bg-red-500 hover:text-white transition-colors"
                          aria-label="Remove logo"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Registering...' : 'Register Company'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterCompanyPage;
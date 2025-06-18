import React from 'react';

export const CloudinaryDebug: React.FC = () => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  return (
    <div className="bg-gray-100 p-4 rounded-lg border">
      <h3 className="font-bold text-lg mb-2">🔧 Cloudinary Debug Info</h3>
      <div className="space-y-2 text-sm">
        <div>
          <strong>Cloud Name:</strong> 
          <span className={cloudName ? 'text-green-600' : 'text-red-600'}>
            {cloudName || '❌ NOT SET'}
          </span>
        </div>
        <div>
          <strong>API Key:</strong> 
          <span className={apiKey ? 'text-green-600' : 'text-red-600'}>
            {apiKey ? '✅ SET' : '❌ NOT SET'}
          </span>
        </div>
        <div>
          <strong>Upload Preset:</strong> 
          <span className={uploadPreset ? 'text-green-600' : 'text-red-600'}>
            {uploadPreset || '❌ NOT SET'}
          </span>
        </div>
        <div className="mt-4 p-2 bg-yellow-100 rounded">
          <strong>Test Upload URL:</strong><br />
          <code className="text-xs break-all">
            {cloudName 
              ? `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
              : '❌ Cannot generate - Cloud Name missing'
            }
          </code>
        </div>
      </div>
    </div>
  );
};

export default CloudinaryDebug;

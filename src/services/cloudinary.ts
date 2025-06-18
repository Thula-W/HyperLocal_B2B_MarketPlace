// Cloudinary configuration for client-side usage
export const cloudinaryConfig = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
  // Note: API Secret should NOT be used in client-side code for security reasons
};

// Upload preset for unsigned uploads (you'll need to create this in your Cloudinary dashboard)
export const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'hyperlocal_b2b';

// Cloudinary upload function for client-side uploads
export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  console.log('🚀 Starting Cloudinary upload...', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    cloudName: cloudinaryConfig.cloudName,
    uploadPreset: UPLOAD_PRESET
  });

  // Validate required config
  if (!cloudinaryConfig.cloudName) {
    throw new Error('VITE_CLOUDINARY_CLOUD_NAME is not configured');
  }
  if (!UPLOAD_PRESET) {
    throw new Error('VITE_CLOUDINARY_UPLOAD_PRESET is not configured');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`;
  console.log('📤 Upload URL:', uploadUrl);

  try {
    console.log('⏳ Sending request to Cloudinary...');
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    console.log('📨 Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Upload failed:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });
      throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Upload successful:', {
      publicId: data.public_id,
      secureUrl: data.secure_url,
      format: data.format,
      bytes: data.bytes
    });
    
    return data.secure_url;
  } catch (error) {
    console.error('💥 Error uploading image to Cloudinary:', error);
    throw error;
  }
};

// Function to upload multiple images
export const uploadMultipleImages = async (files: File[]): Promise<string[]> => {
  const uploadPromises = files.map(file => uploadImageToCloudinary(file));
  return Promise.all(uploadPromises);
};

// Function to delete an image from Cloudinary
export const deleteImageFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    // Note: Deleting images requires server-side implementation with your API secret
    // This is a placeholder - you'll need to implement this on your backend
    console.warn(`Image deletion requires server-side implementation for publicId: ${publicId}`);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

// Utility function to extract public ID from Cloudinary URL
export const extractPublicIdFromUrl = (url: string): string => {
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  return filename.split('.')[0];
};

// Utility function to generate transformation URLs
export const getOptimizedImageUrl = (
  url: string, 
  options: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
  } = {}
): string => {
  if (!url.includes('cloudinary.com')) return url;
  
  const { width, height, quality = 'auto', format = 'auto' } = options;
  
  let transformation = `f_${format},q_${quality}`;
  if (width) transformation += `,w_${width}`;
  if (height) transformation += `,h_${height}`;
  
  // Insert transformation into the URL
  const urlParts = url.split('/upload/');
  if (urlParts.length === 2) {
    return `${urlParts[0]}/upload/${transformation}/${urlParts[1]}`;
  }
  
  return url;
};

export default cloudinaryConfig;

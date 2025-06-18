import React, { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadImageToCloudinary, uploadMultipleImages, getOptimizedImageUrl } from '../services/cloudinary';

interface ImageUploadProps {
  onImageUpload: (urls: string[]) => void;
  maxImages?: number;
  currentImages?: string[];
  className?: string;
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  maxImages = 5,
  currentImages = [],
  className = '',
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>(currentImages);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Check if adding these files would exceed the limit
    if (previewImages.length + files.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images`);
      return;
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      alert('Please select only JPEG, PNG, or WebP images');
      return;
    }

    // Validate file sizes (max 10MB per file)
    const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert('Each image must be less than 10MB');
      return;
    }

    setUploading(true);

    try {
      let uploadedUrls: string[];
      
      if (files.length === 1) {
        const url = await uploadImageToCloudinary(files[0]);
        uploadedUrls = [url];
      } else {
        uploadedUrls = await uploadMultipleImages(files);
      }      const newImages = [...previewImages, ...uploadedUrls];
      console.log('📸 Updating preview images:', {
        previousImages: previewImages,
        uploadedUrls: uploadedUrls,
        newImages: newImages
      });
      setPreviewImages(newImages);
      onImageUpload(newImages);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = previewImages.filter((_, i) => i !== index);
    setPreviewImages(newImages);
    onImageUpload(newImages);
  };

  const openFileDialog = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Button/Area */}
      <div
        onClick={openFileDialog}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${disabled || uploading 
            ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || uploading}
        />
        
        {uploading ? (
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <p className="text-sm text-gray-600">Uploading images...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Click to upload images
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, WebP up to 10MB each (max {maxImages} images)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Image Previews */}
      {previewImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {previewImages.map((url, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={getOptimizedImageUrl(url, { width: 200, height: 200 })}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback if optimized URL fails
                    const target = e.target as HTMLImageElement;
                    if (target.src !== url) {
                      target.src = url;
                    }
                  }}
                />
              </div>
              
              {!disabled && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Progress Info */}
      {previewImages.length > 0 && (
        <p className="text-xs text-gray-500 text-center">
          {previewImages.length} of {maxImages} images uploaded
        </p>
      )}
    </div>
  );
};

export default ImageUpload;

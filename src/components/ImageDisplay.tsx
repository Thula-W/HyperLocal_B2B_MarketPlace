import React from 'react';
import { getOptimizedImageUrl } from '../services/cloudinary';

interface ImageDisplayProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: string;
  fallback?: string;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  quality = 'auto',
  fallback = '/placeholder-image.jpg'
}) => {
  const optimizedSrc = getOptimizedImageUrl(src, {
    width,
    height,
    quality,
    format: 'auto'
  });

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      className={className}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        if (target.src !== fallback) {
          target.src = fallback;
        }
      }}
      loading="lazy"
    />
  );
};

interface ImageGalleryProps {
  images: string[];
  alt: string;
  className?: string;
  imageClassName?: string;
  maxImages?: number;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  alt,
  className = '',
  imageClassName = '',
  maxImages = 4
}) => {
  const displayImages = images.slice(0, maxImages);
  const remainingCount = images.length - maxImages;

  if (displayImages.length === 0) {
    return (
      <div className={`bg-gray-200 rounded-lg flex items-center justify-center ${className}`}>
        <span className="text-gray-500 text-sm">No images</span>
      </div>
    );
  }

  if (displayImages.length === 1) {
    return (
      <div className={className}>
        <ImageDisplay
          src={displayImages[0]}
          alt={alt}
          className={`w-full h-full object-cover rounded-lg ${imageClassName}`}
          width={400}
          height={300}
        />
      </div>
    );
  }

  return (
    <div className={`grid gap-2 ${className}`}>
      {displayImages.length === 2 && (
        <div className="grid grid-cols-2 gap-2">
          {displayImages.map((image, index) => (
            <ImageDisplay
              key={index}
              src={image}
              alt={`${alt} ${index + 1}`}
              className={`w-full h-full object-cover rounded-lg ${imageClassName}`}
              width={200}
              height={200}
            />
          ))}
        </div>
      )}
      
      {displayImages.length === 3 && (
        <div className="grid grid-cols-2 gap-2">
          <ImageDisplay
            src={displayImages[0]}
            alt={`${alt} 1`}
            className={`w-full h-full object-cover rounded-lg row-span-2 ${imageClassName}`}
            width={200}
            height={400}
          />
          <div className="grid grid-rows-2 gap-2">
            <ImageDisplay
              src={displayImages[1]}
              alt={`${alt} 2`}
              className={`w-full h-full object-cover rounded-lg ${imageClassName}`}
              width={200}
              height={195}
            />
            <ImageDisplay
              src={displayImages[2]}
              alt={`${alt} 3`}
              className={`w-full h-full object-cover rounded-lg ${imageClassName}`}
              width={200}
              height={195}
            />
          </div>
        </div>
      )}
      
      {displayImages.length >= 4 && (
        <div className="grid grid-cols-2 gap-2">
          <ImageDisplay
            src={displayImages[0]}
            alt={`${alt} 1`}
            className={`w-full h-full object-cover rounded-lg ${imageClassName}`}
            width={200}
            height={200}
          />
          <ImageDisplay
            src={displayImages[1]}
            alt={`${alt} 2`}
            className={`w-full h-full object-cover rounded-lg ${imageClassName}`}
            width={200}
            height={200}
          />
          <ImageDisplay
            src={displayImages[2]}
            alt={`${alt} 3`}
            className={`w-full h-full object-cover rounded-lg ${imageClassName}`}
            width={200}
            height={200}
          />
          <div className="relative">
            <ImageDisplay
              src={displayImages[3]}
              alt={`${alt} 4`}
              className={`w-full h-full object-cover rounded-lg ${imageClassName}`}
              width={200}
              height={200}
            />
            {remainingCount > 0 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  +{remainingCount}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageDisplay;

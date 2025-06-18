# Cloudinary Setup Guide

This guide will help you set up Cloudinary for image storage in your HyperLocal B2B MarketPlace application.

## Prerequisites

1. A Cloudinary account (free tier available)
2. Node.js and npm installed

## Setup Steps

### 1. Create a Cloudinary Account

1. Visit [Cloudinary](https://cloudinary.com/) and sign up for a free account
2. After registration, go to your Dashboard
3. Note down your **Cloud Name**, **API Key**, and **API Secret**

### 2. Create an Upload Preset

1. In your Cloudinary Dashboard, go to **Settings** → **Upload**
2. Scroll down to **Upload presets**
3. Click **Add upload preset**
4. Configure the preset:
   - **Upload preset name**: `hyperlocal_b2b` (or your preferred name)
   - **Signing Mode**: **Unsigned** (for client-side uploads)
   - **Folder**: `hyperlocal_b2b` (optional, for organization)
   - **Allowed formats**: `jpg,jpeg,png,webp`
   - **Max file size**: `10MB`
   - **Max image width/height**: `2000` (optional, for optimization)
5. Save the preset

### 3. Configure Environment Variables

1. Create a `.env` file in your project root (if it doesn't exist)
2. Add your Firebase and Cloudinary credentials:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
VITE_CLOUDINARY_API_KEY=your_api_key_here
VITE_CLOUDINARY_API_SECRET=your_api_secret_here
VITE_CLOUDINARY_UPLOAD_PRESET=hyperlocal_b2b
```

**Important**: Never commit your `.env` file to version control. Make sure it's in your `.gitignore`.

### 4. Install Dependencies

The required Cloudinary packages are already installed. If you need to reinstall them:

```bash
npm install cloudinary cloudinary-react
```

### 5. Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the "Make Listing" page
3. Try uploading an image using the image upload component
4. Check your Cloudinary Dashboard to see if the image was uploaded successfully

## Features

### Image Upload Component

The `ImageUpload` component provides:
- Drag and drop or click to upload
- Multiple image uploads (up to 5 by default)
- Image preview with remove functionality
- File type validation (JPEG, PNG, WebP)
- File size validation (10MB max per image)
- Automatic image optimization via Cloudinary

### Image Optimization

Images are automatically optimized using Cloudinary's transformation features:
- Format optimization (auto WebP/AVIF when supported)
- Quality optimization
- Responsive sizing
- Progressive loading

### Usage in Components

```tsx
import { ImageUpload } from '../components/ImageUpload';

// In your component
<ImageUpload
  onImageUpload={(urls) => setImageUrls(urls)}
  currentImages={imageUrls}
  maxImages={5}
  disabled={loading}
/>
```

## Troubleshooting

### Upload Preset Not Found
- Ensure the upload preset name in your `.env` matches exactly what you created in Cloudinary
- Make sure the preset is set to "Unsigned"

### CORS Issues
- Cloudinary should handle CORS automatically for image uploads
- If you encounter issues, check your Cloudinary settings

### Environment Variables Not Loading
- Make sure your `.env` file is in the project root
- Restart your development server after adding environment variables
- Variable names must start with `VITE_` for Vite to include them

### Image Not Displaying
- Check the browser console for errors
- Verify the Cloudinary URL is valid
- Check if the image optimization parameters are correct

## Security Notes

1. **API Secret**: Only use the API secret on the server-side. Never expose it in client-side code.
2. **Upload Presets**: Use unsigned upload presets for client-side uploads.
3. **File Validation**: Always validate file types and sizes on both client and server.
4. **Rate Limiting**: Consider implementing rate limiting for uploads to prevent abuse.

## Additional Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Cloudinary React SDK](https://cloudinary.com/documentation/react_integration)
- [Upload Presets Guide](https://cloudinary.com/documentation/upload_presets)

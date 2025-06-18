# Nearby Businesses Feature Setup Guide

## Overview

The Nearby Businesses feature allows users to discover other businesses in their area based on their business address. This feature uses Google Maps API for geocoding and distance calculations.

## Features

- **Address-based Search**: Find businesses near your company's address
- **Radius Control**: Adjust search radius from 1km to 50km
- **Business Type Filtering**: Filter by specific business types
- **Distance Calculation**: See exact distance to each business
- **Contact Information**: View phone, email, and website details
- **Map Integration**: Visual representation with Google Maps
- **Responsive Design**: Works on desktop and mobile devices

## Google Maps API Setup

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - **Maps JavaScript API** (for interactive maps)
   - **Geocoding API** (for address to coordinates conversion)
   - **Places API** (optional, for enhanced business search)

4. Create an API key:
   - Go to "Credentials" in the left sidebar
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key

### 2. Configure API Key Restrictions (Recommended)

For security, restrict your API key:

1. In Google Cloud Console, click on your API key
2. Under "Application restrictions":
   - Choose "HTTP referrers (web sites)"
   - Add your domain (e.g., `localhost:5173/*` for development)
3. Under "API restrictions":
   - Choose "Restrict key"
   - Select the APIs you enabled above

### 3. Add API Key to Your Project

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your API key:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

3. Restart your development server:
   ```bash
   npm run dev
   ```

## Usage

### For Users

1. **Complete Business Profile**: Users must have their business address filled in their profile
2. **Navigate to Nearby**: Click "Nearby" in the navigation menu
3. **Search and Filter**: 
   - Use the search bar to find specific businesses
   - Filter by business type
   - Adjust radius with the slider
4. **View Results**: See businesses sorted by distance
5. **Contact Businesses**: Click on contact information to call, email, or visit websites

### For Developers

The nearby businesses functionality is implemented in:

- **`/src/pages/NearbyBusinessesPage.tsx`**: Main page component
- **`/src/services/mapsService.ts`**: Google Maps API integration
- **Route**: `/nearby` (protected route requiring business completion)

## API Costs

Google Maps API has usage-based pricing:

- **Geocoding API**: $5 per 1000 requests (first 40,000 free per month)
- **Maps JavaScript API**: $7 per 1000 loads (first 28,000 free per month)

For a small to medium B2B marketplace, monthly costs should be minimal due to generous free tiers.

## Development Mode

Without a Google Maps API key, the application will:
- Use mock coordinates for geocoding
- Display sample nearby businesses
- Show a placeholder for the map component

This allows development and testing without API setup.

## Production Considerations

1. **API Key Security**: 
   - Use environment variables
   - Implement API key restrictions
   - Monitor usage in Google Cloud Console

2. **Performance Optimization**:
   - Cache geocoding results
   - Implement pagination for large result sets
   - Use database geospatial queries for better performance

3. **User Experience**:
   - Add loading states for API calls
   - Handle API errors gracefully
   - Implement retry logic for failed requests

## Future Enhancements

- **Interactive Map**: Replace static map with interactive Google Maps component
- **Geolocation**: Allow users to use current location instead of business address
- **Advanced Filters**: Add more business attributes for filtering
- **Favorites**: Let users save favorite businesses
- **Reviews**: Add business rating and review system
- **Directions**: Integrate with Google Maps for turn-by-turn directions

## Troubleshooting

### Common Issues

1. **"API Key not found" errors**:
   - Verify `.env.local` file exists and contains the correct key
   - Restart the development server after adding the key

2. **"Permission denied" errors**:
   - Check API key restrictions in Google Cloud Console
   - Ensure required APIs are enabled

3. **No businesses found**:
   - Verify business addresses are properly formatted
   - Check if there are businesses in the database with addresses
   - Try increasing the search radius

4. **Geocoding failures**:
   - Check address format and completeness
   - Verify API quotas in Google Cloud Console
   - Check browser developer console for API errors

## Support

If you encounter issues with the Nearby Businesses feature:

1. Check the browser developer console for errors
2. Verify your Google Maps API setup
3. Ensure your business profile is complete with a valid address
4. Try refreshing the page or clearing browser cache

For development questions, refer to the [Google Maps Platform documentation](https://developers.google.com/maps/documentation).

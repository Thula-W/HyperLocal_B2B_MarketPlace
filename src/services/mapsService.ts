import { Company } from './firestore';

interface NearbyBusiness {
  id: string;
  name: string;
  address: string;
  businessType: string;
  telephone?: string;
  email?: string;
  website?: string;
  description?: string;
  distance?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface NearbyBusinessesResult {
  businesses: NearbyBusiness[];
  userLocation: { lat: number; lng: number };
}

// Google Maps API key - you'll need to add this to your environment variables
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

/**
 * Geocode an address using Google Maps Geocoding API
 */
const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API key not found. Using mock coordinates.');
    // Return mock coordinates for development
    return { lat: 40.7128, lng: -74.0060 }; // New York City coordinates
  }

  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_MAPS_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    }
    
    throw new Error(`Geocoding failed: ${data.status}`);
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 */
const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Get nearby businesses based on user's address
 */
export const getNearbyBusinesses = async (
  userAddress: string,
  radiusKm: number = 10,
  businessType: string = ''
): Promise<NearbyBusinessesResult> => {
  try {
    // First, geocode the user's address
    const userLocation = await geocodeAddress(userAddress);
    if (!userLocation) {
      throw new Error('Could not geocode user address');
    }

    // For now, we'll get all companies from Firestore and filter them
    // In a real application, you might want to use a geospatial database query
    const { collection, getDocs } = await import('firebase/firestore');
    const { db } = await import('../firebase/firebase');
    
    const companiesRef = collection(db, 'companies');
    const snapshot = await getDocs(companiesRef);
    
    const allBusinesses: NearbyBusiness[] = [];
      for (const doc of snapshot.docs) {
      const company = { id: doc.id, ...doc.data() } as Company & { id: string };
      
      // Skip if business type filter is applied and doesn't match
      if (businessType && company.businessType !== businessType) {
        continue;
      }
      
      // Geocode business address
      const businessLocation = await geocodeAddress(company.address);
      if (!businessLocation) {
        continue;
      }
      
      // Calculate distance
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        businessLocation.lat,
        businessLocation.lng
      );
      
      // Skip if outside radius
      if (distance > radiusKm) {
        continue;
      }
      
      allBusinesses.push({
        id: company.id,
        name: company.name,
        address: company.address,
        businessType: company.businessType,
        telephone: company.telephone,
        email: company.email,
        website: company.website,
        description: company.description,
        distance,
        coordinates: businessLocation,
      });
    }
    
    // Sort by distance
    allBusinesses.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    
    return {
      businesses: allBusinesses,
      userLocation,
    };
  } catch (error) {    console.error('Error getting nearby businesses:', error);
    
    // Return mock data for development
    return {
      businesses: [
        {
          id: '1',
          name: 'TechCorp Solutions',
          address: '123 Tech Street, Silicon Valley, CA',
          businessType: 'Technology',
          telephone: '+1-555-0123',
          email: 'contact@techcorp.com',
          website: 'www.techcorp.com',
          description: 'Leading technology solutions provider for businesses.',
          distance: 2.5,
          coordinates: { lat: 40.7589, lng: -73.9851 },
        },
        {
          id: '2',
          name: 'Green Manufacturing Co.',
          address: '456 Industrial Ave, Business District, CA',
          businessType: 'Manufacturing',
          telephone: '+1-555-0456',
          email: 'info@greenmanuf.com',
          description: 'Sustainable manufacturing solutions for modern businesses.',
          distance: 5.8,
          coordinates: { lat: 40.7505, lng: -73.9934 },
        },
        {
          id: '3',
          name: 'Metro Retail Services',
          address: '789 Commerce Blvd, Downtown, CA',
          businessType: 'Retail',
          telephone: '+1-555-0789',
          email: 'hello@metroretail.com',
          website: 'www.metroretail.com',
          description: 'Comprehensive retail solutions and consulting services.',
          distance: 8.2,
          coordinates: { lat: 40.7614, lng: -73.9776 },
        },
      ],
      userLocation: { lat: 40.7128, lng: -74.0060 },
    };
  }
};

/**
 * Get Google Maps embed URL for displaying a map with markers
 */
export const getMapEmbedUrl = (
  userLocation: { lat: number; lng: number },
  businesses: NearbyBusiness[]
): string => {
  if (!GOOGLE_MAPS_API_KEY) {
    return '';
  }
  
  const center = `${userLocation.lat},${userLocation.lng}`;
  let markers = `markers=color:red%7Clabel:You%7C${center}`;
  
  // Add business markers
  businesses.forEach((business, index) => {
    if (business.coordinates) {
      const label = String.fromCharCode(65 + (index % 26)); // A, B, C, etc.
      markers += `&markers=color:blue%7Clabel:${label}%7C${business.coordinates.lat},${business.coordinates.lng}`;
    }
  });
  
  return `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=12&size=600x400&${markers}&key=${GOOGLE_MAPS_API_KEY}`;
};

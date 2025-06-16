import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  limit 
} from 'firebase/firestore';
import { db } from '../firebase/firebase';

export interface Listing {
  id?: string;
  title: string;
  description: string;
  type: 'product' | 'service';
  price: string;
  category: string;
  userId: string;
  userEmail: string;
  userName: string;
  userCompany: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  views?: number;
  inquiries?: number;
}

export interface Inquiry {
  id?: string;
  listingId: string;
  listingTitle: string;
  fromUserId: string;
  fromUserEmail: string;
  fromUserName: string;
  fromUserCompany: string;
  toUserId: string;
  toUserEmail: string;
  message: string;
  status: 'pending' | 'responded' | 'closed';
  createdAt: string;
  respondedAt?: string;
}

// Listings functions
export const createListing = async (listing: Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const now = new Date().toISOString();
    const listingData = {
      ...listing,
      createdAt: now,
      updatedAt: now,
      views: 0,
      inquiries: 0
    };
    
    const docRef = await addDoc(collection(db, 'listings'), listingData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating listing:', error);
    throw error;
  }
};

export const getUserListings = async (userId: string): Promise<Listing[]> => {
  try {
    // Simplified query without orderBy to avoid index requirements
    const q = query(
      collection(db, 'listings'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const listings: Listing[] = [];
    
    querySnapshot.forEach((doc) => {
      listings.push({ id: doc.id, ...doc.data() } as Listing);
    });
    
    // Sort by createdAt in the frontend
    listings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return listings;
  } catch (error) {
    console.error('Error fetching user listings:', error);
    throw error;
  }
};

export const getAllListings = async (limitCount: number = 20): Promise<Listing[]> => {
  try {
    console.log('getAllListings: Starting query...');
    // Simplified query without orderBy to avoid index requirements
    const q = query(
      collection(db, 'listings'),
      where('status', '==', 'active'),
      limit(limitCount)
    );
    
    console.log('getAllListings: Executing query...');
    const querySnapshot = await getDocs(q);
    console.log('getAllListings: Query returned', querySnapshot.size, 'documents');
    
    const listings: Listing[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('getAllListings: Processing document', doc.id, data);
      listings.push({ id: doc.id, ...data } as Listing);
    });
    
    // Sort by createdAt in the frontend
    listings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    console.log('getAllListings: Returning', listings.length, 'sorted listings');
    return listings;
  } catch (error) {
    console.error('Error fetching listings:', error);
    throw error;
  }
};

export const updateListing = async (listingId: string, updates: Partial<Listing>): Promise<void> => {
  try {
    const listingRef = doc(db, 'listings', listingId);
    await updateDoc(listingRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating listing:', error);
    throw error;
  }
};

export const deleteListing = async (listingId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'listings', listingId));
  } catch (error) {
    console.error('Error deleting listing:', error);
    throw error;
  }
};

// Inquiries functions
export const createInquiry = async (inquiry: Omit<Inquiry, 'id' | 'createdAt'>): Promise<string> => {
  try {
    console.log('createInquiry: Creating inquiry with data:', inquiry);
    
    const inquiryData = {
      ...inquiry,
      createdAt: new Date().toISOString()
    };
    
    console.log('createInquiry: Saving inquiry data:', inquiryData);
    const docRef = await addDoc(collection(db, 'inquiries'), inquiryData);
    console.log('createInquiry: Inquiry saved with ID:', docRef.id);
    
    // Update listing inquiry count
    console.log('createInquiry: Updating listing inquiry count for:', inquiry.listingId);
    const listingRef = doc(db, 'listings', inquiry.listingId);
    const listingDoc = await getDoc(listingRef);
    if (listingDoc.exists()) {
      const currentInquiries = listingDoc.data().inquiries || 0;
      await updateDoc(listingRef, {
        inquiries: currentInquiries + 1
      });
      console.log('createInquiry: Updated listing inquiry count from', currentInquiries, 'to', currentInquiries + 1);
    } else {
      console.warn('createInquiry: Listing document not found:', inquiry.listingId);
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating inquiry:', error);
    throw error;
  }
};

export const getUserInquiries = async (userId: string): Promise<{ sent: Inquiry[], received: Inquiry[] }> => {
  try {
    console.log('getUserInquiries: Starting queries for user:', userId);
    
    // Get inquiries sent by user (simplified query without orderBy)
    const sentQuery = query(
      collection(db, 'inquiries'),
      where('fromUserId', '==', userId)
    );
    
    // Get inquiries received by user (simplified query without orderBy)
    const receivedQuery = query(
      collection(db, 'inquiries'),
      where('toUserId', '==', userId)
    );
    
    console.log('getUserInquiries: Executing parallel queries...');
    const [sentSnapshot, receivedSnapshot] = await Promise.all([
      getDocs(sentQuery),
      getDocs(receivedQuery)
    ]);
    
    console.log('getUserInquiries: Sent query returned', sentSnapshot.size, 'documents');
    console.log('getUserInquiries: Received query returned', receivedSnapshot.size, 'documents');
    
    const sent: Inquiry[] = [];
    const received: Inquiry[] = [];
    
    sentSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('getUserInquiries: Processing sent inquiry', doc.id, data);
      sent.push({ id: doc.id, ...data } as Inquiry);
    });
    
    receivedSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('getUserInquiries: Processing received inquiry', doc.id, data);
      received.push({ id: doc.id, ...data } as Inquiry);
    });
    
    // Sort by createdAt in the frontend
    sent.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    received.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    console.log('getUserInquiries: Returning', sent.length, 'sent and', received.length, 'received inquiries');
    return { sent, received };
  } catch (error) {
    console.error('Error fetching user inquiries:', error);
    throw error;
  }
};

export const updateInquiry = async (inquiryId: string, updates: Partial<Inquiry>): Promise<void> => {
  try {
    const inquiryRef = doc(db, 'inquiries', inquiryId);
    const updateData = { ...updates };
    
    if (updates.status === 'responded') {
      updateData.respondedAt = new Date().toISOString();
    }
    
    await updateDoc(inquiryRef, updateData);
  } catch (error) {
    console.error('Error updating inquiry:', error);
    throw error;
  }
};

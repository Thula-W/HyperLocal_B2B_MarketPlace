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
  limit, 
  onSnapshot,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';

export interface Listing {
  id?: string;
  title: string;
  description: string;
  type: 'product' | 'service';
  price: string;
  category: string;
  quantity?: number; // Available quantity for products
  userId: string;
  userEmail: string;
  userName: string;
  userCompany: string;
  status: 'active' | 'inactive';
  images?: string[]; // Cloudinary URLs
  createdAt: string;
  updatedAt: string;
  views?: number;
  inquiries?: number;
}

export interface Inquiry {
  id?: string;
  listingId: string;
  listingTitle: string;
  listingType: 'product' | 'service'; // Add listing type
  fromUserId: string;
  fromUserEmail: string;
  fromUserName: string;
  fromUserCompany: string;
  toUserId: string;
  toUserEmail: string;
  toUserName: string;
  toUserCompany: string;
  message: string;
  requestedQuantity?: number; // Quantity requested for products
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  respondedAt?: string;
  purchaseStatus?: 'not_purchased' | 'purchased' | 'delivered';
  purchaseDate?: string;
  purchaseAmount?: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  createdAt: string;
}

export interface Company {
  id?: string;
  name: string;
  email: string;
  telephone: string;
  address: string;
  description?: string;
  logoUrl?: string;
  businessType: string;
  registrationNumber?: string;
  operatingSince?: string;
  website?: string;
}

export interface AuctionListing {
  id?: string;
  title: string;
  description: string;
  type: 'product'; // Auctions are typically for physical products
  startingPrice: number;
  currentBid: number;
  buyNowPrice?: number; // Optional "Buy It Now" price
  category: string;
  quantity: number;
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  reason: 'surplus' | 'overstock' | 'discontinued' | 'damaged' | 'returned' | 'other';
  userId: string;
  userEmail: string;
  userName: string;
  userCompany: string;
  status: 'draft' | 'active' | 'ended' | 'sold';
  images?: string[];
  startTime: string;
  endTime: string;
  bids: AuctionBid[];
  views?: number;
  watchers?: string[]; // User IDs watching this auction
  createdAt: string;
  updatedAt: string;
}

export interface AuctionBid {
  id: string;
  amount: number;
  bidderId: string;
  bidderName: string;
  bidderCompany: string;
  bidderEmail: string;
  timestamp: string;
  isWinning: boolean;
}

export interface AuctionWatch {
  id?: string;
  auctionId: string;
  userId: string;
  createdAt: string;
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

export const incrementListingViews = async (listingId: string): Promise<void> => {
  try {
    console.log('Incrementing views for listing:', listingId);
    const listingRef = doc(db, 'listings', listingId);
    const listingDoc = await getDoc(listingRef);
    
    if (listingDoc.exists()) {
      const currentViews = listingDoc.data().views || 0;
      await updateDoc(listingRef, {
        views: currentViews + 1
      });
      console.log('Updated listing views from', currentViews, 'to', currentViews + 1);
    } else {
      console.warn('Listing not found for view increment:', listingId);
    }
  } catch (error) {
    console.error('Error incrementing listing views:', error);
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
    
    if (updates.status === 'accepted' || updates.status === 'rejected') {
      updateData.respondedAt = new Date().toISOString();
    }
    
    await updateDoc(inquiryRef, updateData);
  } catch (error) {
    console.error('Error updating inquiry:', error);
    throw error;
  }
};

// Get or create a chat for an inquiry
export const getOrCreateChatId = async (inquiry: Inquiry): Promise<string> => {
  const chatsRef = collection(db, "chats");
  const q = query(chatsRef, where("inquiryId", "==", inquiry.id));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    return snapshot.docs[0].id;
  }
  const chatDoc = await addDoc(chatsRef, {
    inquiryId: inquiry.id,
    participants: [inquiry.fromUserId, inquiry.toUserId],
    createdAt: serverTimestamp(),
  });
  return chatDoc.id;
};

// Listen to chat messages in real-time
export const listenToChatMessages = (
  chatId: string,
  callback: (messages: ChatMessage[]) => void
) => {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("createdAt", "asc"));
  return onSnapshot(q, (snapshot) => {
    callback(
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatMessage[]
    );
  });
};

// Send a message to a chat
export const sendChatMessage = async (
  chatId: string,
  text: string,
  senderId: string
) => {
  const messagesRef = collection(db, "chats", chatId, "messages");
  await addDoc(messagesRef, {
    text,
    senderId,
    createdAt: serverTimestamp(),
  });
};

// Fetch companies by name prefix (for autocomplete)
export const fetchCompaniesByPrefix = async (prefix: string): Promise<Company[]> => {
  const q = query(
    collection(db, 'companies'),
    where('name', '>=', prefix),
    where('name', '<=', prefix + '\uf8ff')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Company));
};

// Add a new company
export const addCompany = async (company: Omit<Company, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'companies'), company);
  return docRef.id;
};

// Get company by name
export const getCompanyByName = async (companyName: string): Promise<Company | null> => {
  try {
    const q = query(
      collection(db, 'companies'),
      where('name', '==', companyName),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Company;
    }
    return null;
  } catch (error) {
    console.error('Error getting company by name:', error);
    return null;
  }
};

// Get company by user ID (assuming the company email matches user email)
export const getCompanyByUserEmail = async (userEmail: string): Promise<Company | null> => {
  try {
    const q = query(
      collection(db, 'companies'),
      where('email', '==', userEmail),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Company;
    }
    return null;
  } catch (error) {
    console.error('Error getting company by user email:', error);
    return null;
  }
};

// Company transactions
export const getCompanyTransactions = async (userId: string): Promise<Inquiry[]> => {
  try {
    // Get all inquiries sent by this user
    const sentQuery = query(
      collection(db, 'inquiries'),
      where('fromUserId', '==', userId)
    );
    // Get all inquiries received by this user
    const receivedQuery = query(
      collection(db, 'inquiries'),
      where('toUserId', '==', userId)
    );

    const [sentSnap, receivedSnap] = await Promise.all([
      getDocs(sentQuery),
      getDocs(receivedQuery)
    ]);

    // Map and filter for completed purchases
    const sent = sentSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Inquiry))
      .filter(inq => inq.purchaseStatus === 'purchased');
    const received = receivedSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Inquiry))
      .filter(inq => inq.purchaseStatus === 'purchased');

    // Combine and sort by purchaseDate (descending)
    const all = [...sent, ...received].sort((a, b) =>
      (b.purchaseDate ? new Date(b.purchaseDate).getTime() : 0) -
      (a.purchaseDate ? new Date(a.purchaseDate).getTime() : 0)
    );

    return all;
  } catch (error) {
    console.error('Error fetching company transactions:', error);
    throw error;
  }
};

// Auction functions
export const createAuctionListing = async (auction: Omit<AuctionListing, 'id' | 'createdAt' | 'updatedAt' | 'currentBid' | 'bids'>): Promise<string> => {
  try {
    const now = new Date().toISOString();
    const auctionData: Omit<AuctionListing, 'id'> = {
      ...auction,
      currentBid: auction.startingPrice,
      bids: [],
      views: 0,
      watchers: [],
      createdAt: now,
      updatedAt: now,
    };
    
    const docRef = await addDoc(collection(db, 'auctions'), auctionData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating auction listing:', error);
    throw error;
  }
};

export const getActiveAuctions = async (): Promise<AuctionListing[]> => {
  try {
    const now = new Date().toISOString();
    
    // Query only by status to avoid composite index requirement
    const q = query(
      collection(db, 'auctions'),
      where('status', '==', 'active')
    );
    const snapshot = await getDocs(q);
    const auctions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuctionListing));
    
    // Filter by endTime and sort in the frontend
    const activeAuctions = auctions
      .filter(auction => auction.endTime > now)
      .sort((a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime());
    
    return activeAuctions;
  } catch (error) {
    console.error('Error fetching active auctions:', error);
    throw error;
  }
};

export const getAuctionById = async (auctionId: string): Promise<AuctionListing | null> => {
  try {
    const docRef = doc(db, 'auctions', auctionId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as AuctionListing;
    }
    return null;
  } catch (error) {
    console.error('Error fetching auction:', error);
    throw error;
  }
};

export const placeBid = async (auctionId: string, bid: Omit<AuctionBid, 'id' | 'isWinning'>): Promise<void> => {
  try {
    const auctionRef = doc(db, 'auctions', auctionId);
    const auctionSnap = await getDoc(auctionRef);
    
    if (!auctionSnap.exists()) {
      throw new Error('Auction not found');
    }
    
    const auction = auctionSnap.data() as AuctionListing;
    
    // Validate bid amount
    if (bid.amount <= auction.currentBid) {
      throw new Error('Bid must be higher than current bid');
    }
    
    // Check if auction is still active
    const now = new Date().toISOString();
    if (auction.status !== 'active' || auction.endTime <= now) {
      throw new Error('Auction is no longer active');
    }
    
    // Mark all previous bids as not winning
    const updatedBids = auction.bids.map(b => ({ ...b, isWinning: false }));
    
    // Add new bid as winning bid
    const newBid: AuctionBid = {
      ...bid,
      id: `bid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isWinning: true,
    };
    
    updatedBids.push(newBid);
    
    // Update auction with new bid
    await updateDoc(auctionRef, {
      currentBid: bid.amount,
      bids: updatedBids,
      updatedAt: now,
    });
  } catch (error) {
    console.error('Error placing bid:', error);
    throw error;
  }
};

export const watchAuction = async (auctionId: string, userId: string): Promise<void> => {
  try {
    const auctionRef = doc(db, 'auctions', auctionId);
    const auctionSnap = await getDoc(auctionRef);
    
    if (!auctionSnap.exists()) {
      throw new Error('Auction not found');
    }
    
    const auction = auctionSnap.data() as AuctionListing;
    const watchers = auction.watchers || [];
    
    if (!watchers.includes(userId)) {
      watchers.push(userId);
      await updateDoc(auctionRef, {
        watchers,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error watching auction:', error);
    throw error;
  }
};

export const unwatchAuction = async (auctionId: string, userId: string): Promise<void> => {
  try {
    const auctionRef = doc(db, 'auctions', auctionId);
    const auctionSnap = await getDoc(auctionRef);
    
    if (!auctionSnap.exists()) {
      throw new Error('Auction not found');
    }
    
    const auction = auctionSnap.data() as AuctionListing;
    const watchers = (auction.watchers || []).filter(id => id !== userId);
    
    await updateDoc(auctionRef, {
      watchers,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error unwatching auction:', error);
    throw error;
  }
};

export const getUserAuctions = async (userId: string): Promise<AuctionListing[]> => {
  try {
    const q = query(
      collection(db, 'auctions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuctionListing));
  } catch (error) {
    console.error('Error fetching user auctions:', error);
    // If orderBy fails due to index, try without ordering
    try {
      const q = query(
        collection(db, 'auctions'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const auctions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuctionListing));
      // Sort in frontend
      return auctions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (innerError) {
      console.error('Error fetching user auctions (fallback):', innerError);
      return [];
    }
  }
};

export const getUserBids = async (userId: string): Promise<{ auction: AuctionListing, bid: AuctionBid }[]> => {
  try {
    // Get all auctions
    const auctionsSnapshot = await getDocs(collection(db, 'auctions'));
    const userBids: { auction: AuctionListing, bid: AuctionBid }[] = [];
    
    // Check each auction for bids by this user
    auctionsSnapshot.docs.forEach(doc => {
      const auction = { id: doc.id, ...doc.data() } as AuctionListing;
      
      // Find bids by this user
      const userBidsInAuction = auction.bids?.filter(bid => bid.bidderId === userId) || [];
      
      // Add each bid with auction info
      userBidsInAuction.forEach(bid => {
        userBids.push({ auction, bid });
      });
    });
    
    // Sort by bid timestamp (most recent first)
    return userBids.sort((a, b) => new Date(b.bid.timestamp).getTime() - new Date(a.bid.timestamp).getTime());
  } catch (error) {
    console.error('Error fetching user bids:', error);
    return [];
  }
};

export const purchaseListing = async (inquiryId: string, purchaseAmount: number): Promise<void> => {
  try {
    console.log('purchaseListing: Starting purchase for inquiry:', inquiryId);
    
    const inquiryRef = doc(db, 'inquiries', inquiryId);
    
    const purchaseData = {
      purchaseStatus: 'purchased' as const,
      purchaseDate: new Date().toISOString(),
      purchaseAmount
    };
    
    await updateDoc(inquiryRef, purchaseData);
    
    // Optionally, you could also update the listing to mark it as sold or reduce quantity
    // const listingRef = doc(db, 'listings', listingId);
    // await updateDoc(listingRef, { status: 'sold' });
    
    console.log('purchaseListing: Purchase completed successfully');
  } catch (error) {
    console.error('Error completing purchase:', error);
    throw error;
  }
};

export const getListingById = async (listingId: string): Promise<Listing | null> => {
  try {
    const listingRef = doc(db, 'listings', listingId);
    const listingDoc = await getDoc(listingRef);
    
    if (listingDoc.exists()) {
      return { id: listingDoc.id, ...listingDoc.data() } as Listing;
    }
    return null;
  } catch (error) {
    console.error('Error getting listing:', error);
    throw error;
  }
};

// Delete auction
export const deleteAuction = async (auctionId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'auctions', auctionId));
  } catch (error) {
    console.error('Error deleting auction:', error);
    throw error;
  }
};

import React, { useEffect, useRef, useState } from "react";
import {
  getOrCreateChatId,
  listenToChatMessages,
  sendChatMessage,
  ChatMessage,
  purchaseListing,
  getListingById,
  Listing,
} from "../services/firestore";
import { Inquiry } from "../services/firestore";
import { ShoppingCart, CheckCircle } from "lucide-react";

interface InquiryChatProps {
  inquiry: Inquiry;
  currentUserId: string;
  onClose: () => void;
}

export const InquiryChat: React.FC<InquiryChatProps> = ({
  inquiry,
  currentUserId,
  onClose,
}) => {
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [listing, setListing] = useState<Listing | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load or create chat
  useEffect(() => {
    getOrCreateChatId(inquiry).then(setChatId);
  }, [inquiry]);

  // Load listing data
  useEffect(() => {
    const loadListing = async () => {
      try {
        const listingData = await getListingById(inquiry.listingId);
        setListing(listingData);
      } catch (error) {
        console.error("Error loading listing:", error);
      }
    };
    loadListing();
  }, [inquiry.listingId]);

  // Listen for messages
  useEffect(() => {
    if (!chatId) return;
    const unsub = listenToChatMessages(chatId, setMessages);
    return () => unsub && unsub();
  }, [chatId]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chatId) return;
    await sendChatMessage(chatId, input, currentUserId);
    setInput("");
  };

  const handlePurchase = async () => {
    if (!inquiry.id || !listing) return;

    try {
      setIsPurchasing(true);
      const purchaseAmount = parseFloat(listing.price.replace(/[^0-9.-]+/g, "")) || 0;

      await purchaseListing(inquiry.id, purchaseAmount);

      // Show success message (you might want to use a toast notification here)
      alert("Purchase completed successfully!");

      // Close chat or refresh data
      onClose();
    } catch (error) {
      console.error("Purchase failed:", error);
      alert("Purchase failed. Please try again.");
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <div className="font-semibold">
              Chat with{" "}
              {inquiry.fromUserId === currentUserId
                ? inquiry.toUserName
                : inquiry.fromUserName}
            </div>
            <div className="text-xs text-gray-500">
              Listing: {inquiry.listingTitle}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
          >
            &times;
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.senderId === currentUserId ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-3 py-2 rounded-lg max-w-xs ${
                  msg.senderId === currentUserId
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-900"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSendMessage} className="flex p-2 border-t">
          <input
            className="flex-1 px-3 py-2 border rounded-l focus:outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 rounded-r hover:bg-blue-700"
          >
            Send
          </button>        </form>
        
        {/* Purchase button - only visible to buyer when inquiry is accepted and not already purchased */}
        {inquiry.fromUserId === currentUserId && 
         inquiry.status === "accepted" && 
         (!inquiry.purchaseStatus || inquiry.purchaseStatus === 'not_purchased') && 
         listing && (
          <div className="p-4 border-t bg-gray-50">
            <div className="text-sm text-gray-600 mb-2">
              <strong>Price:</strong> {listing.price}
              {inquiry.requestedQuantity && (
                <span> × {inquiry.requestedQuantity} units</span>
              )}
            </div>
            <button
              onClick={handlePurchase}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isPurchasing}
            >
              {isPurchasing ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v16a8 8 0 01-8-8z"
                    />
                  </svg>
                  Processing Purchase...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  <span>Buy Now</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Purchase status display */}
        {inquiry.purchaseStatus === 'purchased' && (
          <div className="p-4 border-t bg-green-50">
            <div className="flex items-center justify-center text-green-700 font-medium">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>
                Purchased on {inquiry.purchaseDate ? new Date(inquiry.purchaseDate).toLocaleDateString() : 'Unknown date'}
              </span>
            </div>
            {inquiry.purchaseAmount && (
              <div className="text-center text-sm text-green-600 mt-1">
                Amount: ${inquiry.purchaseAmount.toFixed(2)}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
import React, { useEffect, useRef, useState } from "react";
import {
  getOrCreateChatId,
  listenToChatMessages,
  sendChatMessage,
  ChatMessage,
} from "../services/firestore";
import { Inquiry } from "../services/firestore";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load or create chat
  useEffect(() => {
    getOrCreateChatId(inquiry).then(setChatId);
  }, [inquiry]);

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
          </button>
        </form>
      </div>
    </div>
  );
};
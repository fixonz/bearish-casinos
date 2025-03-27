import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useWalletContext } from '@/context/WalletContext';

interface ChatMessage {
  id: string;
  username: string;
  profilePicture?: string;
  message: string;
  timestamp: Date;
  isSystem?: boolean;
}

interface ChatBoxProps {
  className?: string;
  onSendMessage?: (message: string) => void;
}

// Demo messages for the chat
const initialMessages: ChatMessage[] = [
  {
    id: '1',
    username: 'System',
    message: 'Welcome to the game chat! Be respectful to other players.',
    timestamp: new Date(Date.now() - 60000 * 10),
    isSystem: true
  },
  {
    id: '2',
    username: 'CryptoBull',
    profilePicture: '/attached_assets/Y2HmxLIx_400x400.jpg',
    message: 'Just hit 5x! Amazing game 🔥',
    timestamp: new Date(Date.now() - 60000 * 5),
  },
  {
    id: '3',
    username: 'DiamondHands',
    profilePicture: '/attached_assets/processed-nft-33-1-dark (1).png',
    message: 'Anyone else having a good run today?',
    timestamp: new Date(Date.now() - 60000 * 2),
  }
];

export function ChatBox({ className = '', onSendMessage }: ChatBoxProps) {
  const { wallet } = useWalletContext();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);
  
  const handleSendMessage = () => {
    if (!inputValue.trim() || !wallet.isConnected) return;
    
    // Create new message
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      username: wallet.username || 'Guest',
      profilePicture: wallet.profilePicture,
      message: inputValue.trim(),
      timestamp: new Date()
    };
    
    // Add to state
    setMessages(prev => [...prev, newMessage]);
    
    // Call callback if provided
    if (onSendMessage) {
      onSendMessage(inputValue.trim());
    }
    
    // Clear input
    setInputValue('');
  };
  
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className={`flex flex-col bg-black/20 border border-zinc-800 rounded-lg h-full ${className}`}>
      <div className="flex items-center justify-between bg-zinc-900 border-b border-zinc-800 px-3 py-2">
        <h3 className="text-sm font-semibold">Live Chat</h3>
        <span className="text-xs text-zinc-500">{messages.length} messages</span>
      </div>
      
      <ScrollArea className="flex-1 p-2" ref={scrollAreaRef}>
        <div className="flex flex-col space-y-2">
          {messages.map(msg => (
            <div 
              key={msg.id} 
              className={`flex items-start ${msg.isSystem ? 'bg-primary/10 p-2 rounded' : ''}`}
            >
              {!msg.isSystem && (
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarImage src={msg.profilePicture} />
                  <AvatarFallback className="text-[10px]">
                    {msg.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <span className={`font-medium text-xs mr-1 ${msg.isSystem ? 'text-primary' : ''}`}>
                    {msg.username}
                  </span>
                  <span className="text-zinc-500 text-xs">
                    {formatTimestamp(msg.timestamp)}
                  </span>
                </div>
                <p className="text-sm break-words">{msg.message}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <div className="p-2 mt-auto border-t border-zinc-800">
        <div className="flex items-center gap-2">
          <Input
            placeholder={wallet.isConnected ? "Type a message..." : "Connect wallet to chat"}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={!wallet.isConnected}
            className="bg-zinc-800 border-zinc-700"
          />
          <Button 
            size="sm" 
            onClick={handleSendMessage}
            disabled={!wallet.isConnected || !inputValue.trim()}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
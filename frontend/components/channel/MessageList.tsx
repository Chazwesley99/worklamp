'use client';

import { useEffect, useRef } from 'react';
import { Message } from '@/lib/api/channel';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  isLoading?: boolean;
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function MessageList({ messages, currentUserId, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading messages...</div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p>No messages yet</p>
          <p className="text-sm mt-1">Be the first to send a message!</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => {
        const isCurrentUser = message.userId === currentUserId;
        const showAvatar = index === 0 || messages[index - 1].userId !== message.userId;

        return (
          <div key={message.id} className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            {showAvatar ? (
              <div className="flex-shrink-0">
                {message.user.avatarUrl ? (
                  <img
                    src={message.user.avatarUrl}
                    alt={message.user.name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                    {message.user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-8 flex-shrink-0" />
            )}

            {/* Message Content */}
            <div className={`flex-1 min-w-0 ${isCurrentUser ? 'text-right' : ''}`}>
              {showAvatar && (
                <div className="flex items-baseline gap-2 mb-1">
                  <span
                    className={`font-medium text-sm text-gray-900 dark:text-white ${
                      isCurrentUser ? 'order-2' : ''
                    }`}
                  >
                    {isCurrentUser ? 'You' : message.user.name}
                  </span>
                  <span
                    className={`text-xs text-gray-500 dark:text-gray-400 ${
                      isCurrentUser ? 'order-1' : ''
                    }`}
                  >
                    {formatTimeAgo(new Date(message.createdAt))}
                  </span>
                </div>
              )}
              <div
                className={`inline-block px-4 py-2 rounded-lg max-w-[70%] break-words ${
                  isCurrentUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                }`}
              >
                {message.content}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { channelApi, Message, CreateChannelRequest, UpdateChannelRequest } from '@/lib/api/channel';
import { ChannelList } from './ChannelList';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ChannelForm } from './ChannelForm';
import { useSocket } from '@/lib/contexts/SocketContext';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Settings, X } from 'lucide-react';

interface ChatPanelProps {
  projectId: string;
  onClose?: () => void;
}

export function ChatPanel({ projectId, onClose }: ChatPanelProps) {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [isChannelFormOpen, setIsChannelFormOpen] = useState(false);
  const [channelFormMode, setChannelFormMode] = useState<'create' | 'edit'>('create');

  // Fetch channels
  const { data: channelsData, isLoading: isLoadingChannels } = useQuery({
    queryKey: ['channels', projectId],
    queryFn: () => channelApi.getChannels(projectId),
    enabled: !!projectId,
  });

  const channels = channelsData?.channels || [];

  // Fetch messages for selected channel
  const { data: messagesData, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['messages', selectedChannelId],
    queryFn: () => channelApi.getMessages(selectedChannelId!, 100),
    enabled: !!selectedChannelId,
  });

  const messages = messagesData?.messages || [];

  // Auto-select first channel
  useEffect(() => {
    if (channels.length > 0 && !selectedChannelId) {
      setSelectedChannelId(channels[0].id);
    }
  }, [channels, selectedChannelId]);

  // Real-time message updates
  useEffect(() => {
    if (!socket || !isConnected || !selectedChannelId) return;

    // Join channel room
    socket.emit('join:channel', { channelId: selectedChannelId });

    // Listen for new messages
    const handleNewMessage = (data: { message: Message }) => {
      queryClient.setQueryData(
        ['messages', selectedChannelId],
        (old: { messages: Message[] } | undefined) => {
          if (!old) return { messages: [data.message] };
          return {
            messages: [...old.messages, data.message],
          };
        }
      );
    };

    socket.on('message:new', handleNewMessage);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.emit('leave:channel', { channelId: selectedChannelId });
    };
  }, [socket, isConnected, selectedChannelId, queryClient]);

  // Create channel mutation
  const createChannelMutation = useMutation({
    mutationFn: (data: CreateChannelRequest | UpdateChannelRequest) =>
      channelApi.createChannel(projectId, data as CreateChannelRequest),
    onSuccess: (newChannel) => {
      queryClient.invalidateQueries({ queryKey: ['channels', projectId] });
      setSelectedChannelId(newChannel.id);
    },
  });

  // Create message mutation
  const createMessageMutation = useMutation({
    mutationFn: (content: string) => channelApi.createMessage(selectedChannelId!, { content }),
    onSuccess: (newMessage) => {
      // Optimistically add message to list
      queryClient.setQueryData(
        ['messages', selectedChannelId],
        (old: { messages: Message[] } | undefined) => {
          if (!old) return { messages: [newMessage] };
          return {
            messages: [...old.messages, newMessage],
          };
        }
      );
    },
  });

  const handleCreateChannel = () => {
    setChannelFormMode('create');
    setIsChannelFormOpen(true);
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedChannelId) return;
    await createMessageMutation.mutateAsync(content);
  };

  const selectedChannel = channels.find((c) => c.id === selectedChannelId);
  const canPost = selectedChannel?.userPermissions.canPost ?? false;

  return (
    <div className="flex h-full bg-white dark:bg-gray-900">
      {/* Channel List Sidebar */}
      <div className="w-64 flex-shrink-0">
        <ChannelList
          channels={channels}
          selectedChannelId={selectedChannelId}
          onSelectChannel={setSelectedChannelId}
          onCreateChannel={handleCreateChannel}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChannel ? (
          <>
            {/* Channel Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  # {selectedChannel.name}
                </h3>
                {selectedChannel.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {selectedChannel.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!isConnected && (
                  <span className="text-xs text-yellow-600 dark:text-yellow-400">
                    Reconnecting...
                  </span>
                )}
                <button
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  title="Channel Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    title="Close Chat"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <MessageList
              messages={messages}
              currentUserId={user?.id || ''}
              isLoading={isLoadingMessages}
            />

            {/* Message Input */}
            <MessageInput
              onSendMessage={handleSendMessage}
              disabled={!canPost || !isConnected}
              placeholder={
                !canPost
                  ? 'You do not have permission to post in this channel'
                  : 'Type a message...'
              }
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
            {isLoadingChannels ? (
              <p>Loading channels...</p>
            ) : channels.length === 0 ? (
              <div className="text-center">
                <p>No channels available</p>
                <button
                  onClick={handleCreateChannel}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create First Channel
                </button>
              </div>
            ) : (
              <p>Select a channel to start chatting</p>
            )}
          </div>
        )}
      </div>

      {/* Channel Form Modal */}
      <ChannelForm
        isOpen={isChannelFormOpen}
        onClose={() => setIsChannelFormOpen(false)}
        onSubmit={async (data) => {
          await createChannelMutation.mutateAsync(data);
        }}
        mode={channelFormMode}
      />
    </div>
  );
}

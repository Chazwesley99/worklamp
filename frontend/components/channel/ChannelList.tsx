'use client';

import { Channel } from '@/lib/api/channel';
import { Lock, Hash, Users } from 'lucide-react';

interface ChannelListProps {
  channels: Channel[];
  selectedChannelId: string | null;
  onSelectChannel: (channelId: string) => void;
  onCreateChannel: () => void;
}

export function ChannelList({
  channels,
  selectedChannelId,
  onSelectChannel,
  onCreateChannel,
}: ChannelListProps) {
  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Channels</h2>
          <button
            onClick={onCreateChannel}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            title="Create Channel"
          >
            +
          </button>
        </div>
      </div>

      {/* Channel List */}
      <div className="flex-1 overflow-y-auto">
        {channels.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No channels yet</p>
            <p className="text-xs mt-1">Create one to start chatting</p>
          </div>
        ) : (
          <div className="py-2">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => onSelectChannel(channel.id)}
                className={`w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                  selectedChannelId === channel.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600'
                    : ''
                }`}
              >
                {channel.isPrivate ? (
                  <Lock className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                ) : (
                  <Hash className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                )}
                <div className="flex-1 text-left min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white truncate">
                    {channel.name}
                  </div>
                  {channel.description && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {channel.description}
                    </div>
                  )}
                </div>
                {channel.messageCount > 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                    {channel.messageCount}
                  </span>
                )}
                {!channel.userPermissions.canPost && (
                  <span
                    className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded flex-shrink-0"
                    title="Read-only"
                  >
                    RO
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

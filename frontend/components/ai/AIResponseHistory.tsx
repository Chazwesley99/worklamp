'use client';

import { useState, useEffect } from 'react';
import { aiResponseApi, AIResponse } from '@/lib/api/aiResponse';
import { useToast } from '@/lib/contexts/ToastContext';

interface AIResponseHistoryProps {
  resourceType: 'task' | 'bug' | 'feature';
  resourceId: string;
  renderResponse: (responseData: any) => React.ReactNode;
}

export function AIResponseHistory({
  resourceType,
  resourceId,
  renderResponse,
}: AIResponseHistoryProps) {
  const [responses, setResponses] = useState<AIResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadResponses();
  }, [resourceType, resourceId]);

  const loadResponses = async () => {
    try {
      setIsLoading(true);
      const data = await aiResponseApi.getResponses(resourceType, resourceId);
      setResponses(data);
    } catch (error) {
      console.error('Failed to load AI responses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this AI response?')) return;

    try {
      await aiResponseApi.deleteResponse(id);
      showToast('AI response deleted', 'success');
      loadResponses();
    } catch (error) {
      showToast('Failed to delete AI response', 'error');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 py-2">
        Loading previous responses...
      </div>
    );
  }

  if (responses.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        Previous AI Responses
      </h5>
      {responses.map((response) => (
        <div
          key={response.id}
          className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
        >
          <button
            onClick={() => setExpandedId(expandedId === response.id ? null : response.id)}
            className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors text-left"
          >
            <span className="text-sm text-gray-700 dark:text-gray-300">
              AI Response from {formatDate(response.createdAt)}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(response.id);
                }}
                className="text-gray-500 hover:text-red-600 dark:hover:text-red-400 p-1"
                title="Delete response"
              >
                🗑️
              </button>
              <span className="text-gray-500 dark:text-gray-400">
                {expandedId === response.id ? '▼' : '▶'}
              </span>
            </div>
          </button>
          {expandedId === response.id && (
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              {renderResponse(response.responseData)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

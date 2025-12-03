'use client';

import { useState } from 'react';

interface JsonViewerProps {
  data: unknown;
  title?: string;
}

export function JsonViewer({ data, title }: JsonViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const jsonString = JSON.stringify(data, null, 2);

  return (
    <div className="border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
          <h4 className="font-medium text-gray-900 dark:text-white">
            {title || 'Raw Response Data'}
          </h4>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
        The AI returned data in an unexpected format. Here&apos;s the raw response:
      </p>
      {isExpanded && (
        <pre className="bg-gray-900 text-gray-100 rounded p-3 text-xs overflow-x-auto max-h-96 overflow-y-auto">
          {jsonString}
        </pre>
      )}
    </div>
  );
}

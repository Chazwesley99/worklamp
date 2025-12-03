'use client';

import { CopyButton } from '../ui/CopyButton';
import { isRenderableValue, toRenderableString } from '@/lib/utils/renderHelpers';

interface TaskAnalysisViewerProps {
  analysis: unknown;
  suggestedApproach: unknown;
  aiAgentPrompt: unknown;
}

export function TaskAnalysisViewer({
  analysis,
  suggestedApproach,
  aiAgentPrompt,
}: TaskAnalysisViewerProps) {
  return (
    <div className="space-y-3">
      {/* Analysis Section */}
      {analysis !== undefined && (
        <div>
          <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Analysis</h5>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {isRenderableValue(analysis) ? (analysis as string) : toRenderableString(analysis)}
          </p>
        </div>
      )}

      {/* Suggested Approach Section */}
      {suggestedApproach !== undefined && (
        <div>
          <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Suggested Approach
          </h5>
          {Array.isArray(suggestedApproach) ? (
            <ul className="list-disc list-inside space-y-1">
              {suggestedApproach.map((step, index) => (
                <li key={index} className="text-xs text-gray-600 dark:text-gray-400">
                  {isRenderableValue(step) ? step : toRenderableString(step)}
                </li>
              ))}
            </ul>
          ) : (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded p-2">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {isRenderableValue(suggestedApproach)
                  ? (suggestedApproach as string)
                  : toRenderableString(suggestedApproach)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* AI Agent Prompt Section */}
      {aiAgentPrompt !== undefined && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300">
              AI Agent Prompt
            </h5>
            <CopyButton
              value={
                typeof aiAgentPrompt === 'string'
                  ? aiAgentPrompt
                  : toRenderableString(aiAgentPrompt)
              }
            />
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 rounded p-2 text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono max-h-40 overflow-y-auto">
            {isRenderableValue(aiAgentPrompt)
              ? (aiAgentPrompt as string)
              : toRenderableString(aiAgentPrompt)}
          </div>
        </div>
      )}
    </div>
  );
}

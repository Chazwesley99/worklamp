'use client';

import { CopyButton } from '@/components/ui/CopyButton';
import { SafeRender } from '@/components/ui/SafeRender';
import { JsonViewer } from '@/components/ui/JsonViewer';
import { isRenderableValue, toRenderableString } from '@/lib/utils/renderHelpers';

interface BugAnalysisViewerProps {
  analysis: any;
  suggestedFixes: any;
  aiAgentPrompt: any;
}

export function BugAnalysisViewer({
  analysis,
  suggestedFixes,
  aiAgentPrompt,
}: BugAnalysisViewerProps) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Analysis</h4>
        <SafeRender data={analysis}>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {isRenderableValue(analysis) ? analysis : toRenderableString(analysis)}
          </p>
        </SafeRender>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Suggested Fixes</h4>
        <SafeRender data={suggestedFixes}>
          {Array.isArray(suggestedFixes) ? (
            <ul className="list-disc list-inside space-y-1">
              {suggestedFixes.map((fix, index) => (
                <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
                  {isRenderableValue(fix) ? fix : toRenderableString(fix)}
                </li>
              ))}
            </ul>
          ) : (
            <JsonViewer data={suggestedFixes} title="Unexpected Fixes Format" />
          )}
        </SafeRender>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900 dark:text-white">AI Agent Prompt</h4>
          <CopyButton
            value={
              typeof aiAgentPrompt === 'string' ? aiAgentPrompt : toRenderableString(aiAgentPrompt)
            }
          />
        </div>
        <SafeRender data={aiAgentPrompt}>
          <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
            {isRenderableValue(aiAgentPrompt) ? aiAgentPrompt : toRenderableString(aiAgentPrompt)}
          </div>
        </SafeRender>
      </div>
    </div>
  );
}

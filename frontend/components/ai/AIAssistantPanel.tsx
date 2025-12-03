'use client';

import { useState } from 'react';
import { aiApi, AnalyzeBugResponse, GenerateFeatureSpecResponse } from '@/lib/api/ai';
import { Button } from '@/components/ui/Button';
import { CopyButton } from '@/components/ui/CopyButton';
import { useToast } from '@/lib/contexts/ToastContext';
import { SafeRender } from '@/components/ui/SafeRender';
import { JsonViewer } from '@/components/ui/JsonViewer';
import { FeatureSpecViewer } from './FeatureSpecViewer';
import { isRenderableValue, toRenderableString, isPlainObject } from '@/lib/utils/renderHelpers';

interface AIAssistantPanelProps {
  type: 'bug' | 'feature';
  title: string;
  description: string;
  url?: string;
  imageUrl?: string;
}

export function AIAssistantPanel({
  type,
  title,
  description,
  url,
  imageUrl,
}: AIAssistantPanelProps) {
  const [loading, setLoading] = useState(false);
  const [bugAnalysis, setBugAnalysis] = useState<AnalyzeBugResponse | null>(null);
  const [featureSpec, setFeatureSpec] = useState<GenerateFeatureSpecResponse | null>(null);
  const { showToast } = useToast();

  const handleAnalyze = async () => {
    try {
      setLoading(true);

      if (type === 'bug') {
        const result = await aiApi.analyzeBug({
          title,
          description,
          url,
          imageUrl,
        });
        setBugAnalysis(result);
      } else {
        const result = await aiApi.generateFeatureSpec({
          title,
          description,
        });
        setFeatureSpec(result);
      }
    } catch (error: unknown) {
      console.error('AI analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze with AI';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePrompt = async () => {
    try {
      setLoading(true);
      const result = await aiApi.generatePrompt({
        type,
        title,
        description,
        context: type === 'bug' ? url : undefined,
      });

      // Copy to clipboard - handle focus issues
      try {
        await navigator.clipboard.writeText(result.prompt);
        showToast('AI agent prompt copied to clipboard', 'success');
      } catch (clipboardError) {
        // Fallback if clipboard fails due to focus issues
        console.warn('Clipboard write failed, prompt is available in the panel');
        showToast('Prompt generated successfully', 'success');
      }
    } catch (error: unknown) {
      console.error('Prompt generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate prompt';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Assistant</h3>
        <div className="flex gap-2">
          <Button onClick={handleAnalyze} disabled={loading} size="sm">
            {loading ? 'Analyzing...' : type === 'bug' ? 'Analyze Bug' : 'Generate Spec'}
          </Button>
          <Button onClick={handleGeneratePrompt} disabled={loading} size="sm" variant="secondary">
            {loading ? 'Generating...' : 'Generate Prompt'}
          </Button>
        </div>
      </div>

      {type === 'bug' && bugAnalysis && (
        <SafeRender data={bugAnalysis}>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Analysis</h4>
              <SafeRender data={bugAnalysis.analysis}>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {isRenderableValue(bugAnalysis.analysis)
                    ? bugAnalysis.analysis
                    : toRenderableString(bugAnalysis.analysis)}
                </p>
              </SafeRender>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Suggested Fixes</h4>
              <SafeRender data={bugAnalysis.suggestedFixes}>
                {Array.isArray(bugAnalysis.suggestedFixes) ? (
                  <ul className="list-disc list-inside space-y-1">
                    {bugAnalysis.suggestedFixes.map((fix, index) => (
                      <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
                        {isRenderableValue(fix) ? fix : toRenderableString(fix)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <JsonViewer data={bugAnalysis.suggestedFixes} title="Unexpected Fixes Format" />
                )}
              </SafeRender>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">AI Agent Prompt</h4>
                <CopyButton
                  value={
                    typeof bugAnalysis.aiAgentPrompt === 'string'
                      ? bugAnalysis.aiAgentPrompt
                      : toRenderableString(bugAnalysis.aiAgentPrompt)
                  }
                />
              </div>
              <SafeRender data={bugAnalysis.aiAgentPrompt}>
                <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                  {isRenderableValue(bugAnalysis.aiAgentPrompt)
                    ? bugAnalysis.aiAgentPrompt
                    : toRenderableString(bugAnalysis.aiAgentPrompt)}
                </div>
              </SafeRender>
            </div>
          </div>
        </SafeRender>
      )}

      {type === 'feature' && featureSpec && (
        <SafeRender data={featureSpec}>
          <div className="space-y-4">
            {/* Show title and description if they're simple strings */}
            {featureSpec.suggestedTitle && isRenderableValue(featureSpec.suggestedTitle) && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Suggested Title</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {featureSpec.suggestedTitle}
                </p>
              </div>
            )}

            {featureSpec.suggestedDescription &&
              isRenderableValue(featureSpec.suggestedDescription) && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Suggested Description
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {featureSpec.suggestedDescription}
                  </p>
                </div>
              )}

            {/* Specification - check if it's a structured spec or plain text */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">Specification</h4>
                <CopyButton
                  value={
                    typeof featureSpec.specification === 'string'
                      ? featureSpec.specification
                      : toRenderableString(featureSpec.specification)
                  }
                />
              </div>
              <SafeRender data={featureSpec.specification}>
                {(() => {
                  // Check if specification is a structured object with userStories or technicalConsiderations
                  if (
                    isPlainObject(featureSpec.specification) &&
                    (('userStories' in featureSpec.specification &&
                      Array.isArray(featureSpec.specification.userStories)) ||
                      ('technicalConsiderations' in featureSpec.specification &&
                        isPlainObject(featureSpec.specification.technicalConsiderations)))
                  ) {
                    return (
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                        <FeatureSpecViewer spec={featureSpec.specification} />
                      </div>
                    );
                  }

                  // Otherwise display as text or JSON
                  if (isRenderableValue(featureSpec.specification)) {
                    return (
                      <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {featureSpec.specification}
                      </div>
                    );
                  }

                  // Fallback to JSON viewer
                  return <JsonViewer data={featureSpec.specification} title="Specification Data" />;
                })()}
              </SafeRender>
            </div>
          </div>
        </SafeRender>
      )}

      {!bugAnalysis && !featureSpec && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          Click &quot;{type === 'bug' ? 'Analyze Bug' : 'Generate Spec'}&quot; to get AI assistance
        </p>
      )}
    </div>
  );
}

'use client';

import { CopyButton } from '../ui/CopyButton';

interface UserStory {
  id: string;
  role: string;
  story: string;
  acceptanceCriteria: string[];
}

interface TechnicalConsiderations {
  integrationPoints?: string[];
  aiAgentArchitecture?: string[];
  security?: string[];
  scalabilityAndPerformance?: string[];
  uiUx?: string[];
  errorHandlingAndObservability?: string[];
  configuration?: string[];
  [key: string]: string[] | undefined;
}

interface FeatureSpec {
  userStories?: UserStory[];
  technicalConsiderations?: TechnicalConsiderations;
  [key: string]: unknown;
}

interface FeatureSpecViewerProps {
  spec: FeatureSpec | string;
}

export function FeatureSpecViewer({ spec }: FeatureSpecViewerProps) {
  // Parse if string
  let parsedSpec: FeatureSpec;
  try {
    parsedSpec = typeof spec === 'string' ? JSON.parse(spec) : spec;
  } catch {
    return (
      <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
        {typeof spec === 'string' ? spec : JSON.stringify(spec, null, 2)}
      </div>
    );
  }

  const { userStories, technicalConsiderations } = parsedSpec;

  // Convert technical considerations keys to readable titles
  const formatSectionTitle = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  return (
    <div className="space-y-6">
      {/* User Stories Section */}
      {userStories && userStories.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">📖 User Stories</h4>
            <CopyButton
              value={userStories
                .map(
                  (us) =>
                    `${us.id}: ${us.story}\n\nAcceptance Criteria:\n${us.acceptanceCriteria.map((ac) => `- ${ac}`).join('\n')}`
                )
                .join('\n\n---\n\n')}
            />
          </div>
          <div className="space-y-4">
            {userStories.map((story) => (
              <div
                key={story.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900"
              >
                <div className="flex items-start gap-3 mb-2">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                    {story.id}
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400 italic">
                    {story.role}
                  </span>
                </div>
                <p className="text-sm text-gray-900 dark:text-white mb-3 font-medium">
                  {story.story}
                </p>
                <div>
                  <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Acceptance Criteria:
                  </h5>
                  <ul className="space-y-1">
                    {story.acceptanceCriteria.map((criteria, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2"
                      >
                        <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                        <span>{criteria}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Technical Considerations Section */}
      {technicalConsiderations && Object.keys(technicalConsiderations).length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              🔧 Technical Considerations
            </h4>
            <CopyButton
              value={Object.entries(technicalConsiderations)
                .map(
                  ([key, items]) =>
                    `${formatSectionTitle(key)}:\n${items?.map((item) => `- ${item}`).join('\n') || ''}`
                )
                .join('\n\n')}
            />
          </div>
          <div className="space-y-4">
            {Object.entries(technicalConsiderations).map(([key, items]) => {
              if (!items || items.length === 0) return null;
              return (
                <div key={key} className="border-l-4 border-purple-500 pl-4">
                  <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    {formatSectionTitle(key)}
                  </h5>
                  <ul className="space-y-2">
                    {items.map((item, idx) => {
                      // Check if item has bold markers (e.g., **text:**)
                      const parts = item.split(/(\*\*[^*]+\*\*)/g);
                      return (
                        <li
                          key={idx}
                          className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2"
                        >
                          <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
                          <span>
                            {parts.map((part, i) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return (
                                  <strong
                                    key={i}
                                    className="font-semibold text-gray-900 dark:text-white"
                                  >
                                    {part.slice(2, -2)}
                                  </strong>
                                );
                              }
                              return <span key={i}>{part}</span>;
                            })}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Fallback for other fields */}
      {Object.keys(parsedSpec).some(
        (key) => key !== 'userStories' && key !== 'technicalConsiderations'
      ) && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Additional Information
          </h4>
          <pre className="text-xs bg-gray-50 dark:bg-gray-900 rounded p-3 overflow-x-auto">
            {JSON.stringify(
              Object.fromEntries(
                Object.entries(parsedSpec).filter(
                  ([key]) => key !== 'userStories' && key !== 'technicalConsiderations'
                )
              ),
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
}

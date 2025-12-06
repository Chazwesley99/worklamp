'use client';

import { CopyButton } from '@/components/ui/CopyButton';
import { SafeRender } from '@/components/ui/SafeRender';
import { isRenderableValue, toRenderableString } from '@/lib/utils/renderHelpers';

interface FeatureSpecificationViewerProps {
  responseData: any;
}

export function FeatureSpecificationViewer({ responseData }: FeatureSpecificationViewerProps) {
  const { suggestedTitle, suggestedDescription, specification } = responseData;

  return (
    <div className="space-y-4">
      {/* Suggested Title */}
      {suggestedTitle && isRenderableValue(suggestedTitle) && (
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Suggested Title</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">{suggestedTitle}</p>
        </div>
      )}

      {/* Suggested Description */}
      {suggestedDescription && isRenderableValue(suggestedDescription) && (
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Suggested Description</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {suggestedDescription}
          </p>
        </div>
      )}

      {/* Specification */}
      {specification && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900 dark:text-white">Specification</h4>
            <CopyButton
              value={
                typeof specification === 'string'
                  ? specification
                  : JSON.stringify(specification, null, 2)
              }
            />
          </div>

          <SafeRender data={specification}>
            {typeof specification === 'string' ? (
              <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {specification}
              </div>
            ) : (
              <div className="space-y-4">
                {/* User Stories */}
                {specification.userStories && Array.isArray(specification.userStories) && (
                  <div>
                    <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                      User Stories
                    </h5>
                    <ul className="space-y-2">
                      {specification.userStories.map((story: any, index: number) => (
                        <li
                          key={index}
                          className="text-sm text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-3 rounded"
                        >
                          {typeof story === 'string'
                            ? story
                            : story.story || toRenderableString(story)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Acceptance Criteria */}
                {specification.acceptanceCriteria &&
                  Array.isArray(specification.acceptanceCriteria) && (
                    <div>
                      <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                        Acceptance Criteria
                      </h5>
                      <ul className="space-y-2">
                        {specification.acceptanceCriteria.map((criteria: any, index: number) => (
                          <li
                            key={index}
                            className="text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded"
                          >
                            {criteria.id && (
                              <span className="font-semibold text-green-700 dark:text-green-300">
                                {criteria.id}:{' '}
                              </span>
                            )}
                            <span className="text-gray-700 dark:text-gray-300">
                              {criteria.description || toRenderableString(criteria)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Technical Considerations */}
                {specification.technicalConsiderations && (
                  <div>
                    <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                      Technical Considerations
                    </h5>
                    <div className="space-y-3">
                      {Object.entries(specification.technicalConsiderations).map(
                        ([key, value]: [string, any]) => (
                          <div key={key} className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded">
                            <h6 className="font-semibold text-purple-700 dark:text-purple-300 mb-2 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </h6>
                            {value.stack && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                Stack: {value.stack}
                              </p>
                            )}
                            {value.strategy && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                Strategy: {value.strategy}
                              </p>
                            )}
                            {value.details && Array.isArray(value.details) && (
                              <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                {value.details.map((detail: any, idx: number) => (
                                  <li
                                    key={idx}
                                    className="pl-3 border-l-2 border-purple-300 dark:border-purple-700"
                                  >
                                    {typeof detail === 'string'
                                      ? detail
                                      : toRenderableString(detail)}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Fallback for any other fields */}
                {Object.keys(specification).some(
                  (key) =>
                    !['userStories', 'acceptanceCriteria', 'technicalConsiderations'].includes(key)
                ) && (
                  <div>
                    <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                      Additional Details
                    </h5>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 text-sm text-gray-700 dark:text-gray-300">
                      <pre className="whitespace-pre-wrap overflow-x-auto">
                        {JSON.stringify(
                          Object.fromEntries(
                            Object.entries(specification).filter(
                              ([key]) =>
                                ![
                                  'userStories',
                                  'acceptanceCriteria',
                                  'technicalConsiderations',
                                ].includes(key)
                            )
                          ),
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </SafeRender>
        </div>
      )}
    </div>
  );
}

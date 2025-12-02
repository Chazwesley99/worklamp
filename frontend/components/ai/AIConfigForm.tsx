'use client';

import { useState, useEffect } from 'react';
import { aiApi, AIConfig } from '@/lib/api/ai';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/lib/contexts/ToastContext';

export function AIConfigForm() {
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [provider, setProvider] = useState<'openai' | 'google' | 'platform'>('platform');
  const [apiKey, setApiKey] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await aiApi.getConfig();
      if (data) {
        setConfig(data);
        setProvider(data.provider);
        setIsEnabled(data.isEnabled);
        setApiKey(''); // Don't show the actual API key
      }
    } catch (error: unknown) {
      console.error('Failed to load AI config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validate
      if (provider !== 'platform' && !apiKey && !config) {
        showToast('API key is required when not using platform provider', 'error');
        return;
      }

      if (config) {
        // Update existing config
        const updateData: {
          provider: 'openai' | 'google' | 'platform';
          isEnabled: boolean;
          apiKey?: string;
        } = {
          provider,
          isEnabled,
        };

        // Only include API key if it was changed
        if (apiKey) {
          updateData.apiKey = apiKey;
        }

        const updated = await aiApi.updateConfig(updateData);
        setConfig(updated);
        showToast('AI configuration updated successfully', 'success');
      } else {
        // Create new config
        const created = await aiApi.createConfig({
          provider,
          apiKey: apiKey || undefined,
          isEnabled,
        });
        setConfig(created);
        showToast('AI configuration created successfully', 'success');
      }

      setApiKey(''); // Clear the API key input
    } catch (error: unknown) {
      console.error('Failed to save AI config:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to save AI configuration';
      showToast(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete the AI configuration?')) {
      return;
    }

    try {
      setSaving(true);
      await aiApi.deleteConfig();
      setConfig(null);
      setProvider('platform');
      setApiKey('');
      setIsEnabled(true);
      showToast('AI configuration deleted successfully', 'success');
    } catch (error: unknown) {
      console.error('Failed to delete AI config:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete AI configuration';
      showToast(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500 dark:text-gray-400">Loading AI configuration...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Provider
          </label>
          <Select
            value={provider}
            onChange={(e) => setProvider(e.target.value as 'openai' | 'google' | 'platform')}
            disabled={saving}
            options={[
              { value: 'platform', label: "Platform (Use Worklamp's API keys)" },
              { value: 'openai', label: 'OpenAI (Your own API key)' },
              { value: 'google', label: 'Google AI (Your own API key)' },
            ]}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {provider === 'platform'
              ? 'Use Worklamp platform API keys (if available)'
              : 'Provide your own API key'}
          </p>
        </div>

        {provider !== 'platform' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              API Key
            </label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={config?.hasApiKey ? 'Enter new API key to update' : 'Enter your API key'}
              disabled={saving}
            />
            {config?.hasApiKey && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                ✓ API key is configured (enter a new one to update)
              </p>
            )}
          </div>
        )}

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isEnabled"
            checked={isEnabled}
            onChange={(e) => setIsEnabled(e.target.checked)}
            disabled={saving}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isEnabled" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Enable AI assistance
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : config ? 'Update Configuration' : 'Create Configuration'}
        </Button>
        {config && (
          <Button onClick={handleDelete} disabled={saving} variant="secondary">
            Delete Configuration
          </Button>
        )}
      </div>
    </div>
  );
}

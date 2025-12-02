import { prisma } from '../config/database';
import { encrypt, decrypt } from '../utils/encryption';
import { CreateAIConfigInput, UpdateAIConfigInput } from '../validators/aiconfig.validator';

export class AIConfigService {
  /**
   * Get AI configuration for a tenant
   */
  async getAIConfig(tenantId: string) {
    const config = await prisma.aIConfig.findUnique({
      where: { tenantId },
    });

    if (!config) {
      return null;
    }

    // Decrypt API key if present
    let decryptedApiKey: string | null = null;
    if (config.apiKey) {
      try {
        decryptedApiKey = decrypt(config.apiKey);
      } catch (error) {
        console.error('Failed to decrypt API key:', error);
        // Return config without decrypted key if decryption fails
      }
    }

    return {
      id: config.id,
      tenantId: config.tenantId,
      provider: config.provider,
      apiKey: decryptedApiKey,
      isEnabled: config.isEnabled,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  }

  /**
   * Create AI configuration for a tenant
   */
  async createAIConfig(tenantId: string, data: CreateAIConfigInput) {
    // Verify tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new Error('TENANT_NOT_FOUND');
    }

    // Check if config already exists
    const existingConfig = await prisma.aIConfig.findUnique({
      where: { tenantId },
    });

    if (existingConfig) {
      throw new Error('AI_CONFIG_ALREADY_EXISTS');
    }

    // Validate provider and API key combination
    if (data.provider !== 'platform' && !data.apiKey) {
      throw new Error('API_KEY_REQUIRED_FOR_NON_PLATFORM_PROVIDER');
    }

    // Encrypt API key if provided
    let encryptedApiKey: string | null = null;
    if (data.apiKey) {
      encryptedApiKey = encrypt(data.apiKey);
    }

    // Create config
    const config = await prisma.aIConfig.create({
      data: {
        tenantId,
        provider: data.provider,
        apiKey: encryptedApiKey,
        isEnabled: data.isEnabled ?? true,
      },
    });

    // Return config with decrypted API key
    return {
      id: config.id,
      tenantId: config.tenantId,
      provider: config.provider,
      apiKey: data.apiKey,
      isEnabled: config.isEnabled,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  }

  /**
   * Update AI configuration
   */
  async updateAIConfig(tenantId: string, data: UpdateAIConfigInput) {
    // Verify config exists
    const existingConfig = await prisma.aIConfig.findUnique({
      where: { tenantId },
    });

    if (!existingConfig) {
      throw new Error('AI_CONFIG_NOT_FOUND');
    }

    // Validate provider and API key combination
    const newProvider = data.provider ?? existingConfig.provider;
    if (newProvider !== 'platform' && data.apiKey === null) {
      throw new Error('API_KEY_REQUIRED_FOR_NON_PLATFORM_PROVIDER');
    }

    // Encrypt API key if provided
    let encryptedApiKey: string | null | undefined = undefined;
    if (data.apiKey !== undefined) {
      if (data.apiKey === null) {
        encryptedApiKey = null;
      } else {
        encryptedApiKey = encrypt(data.apiKey);
      }
    }

    // Update config
    const config = await prisma.aIConfig.update({
      where: { tenantId },
      data: {
        provider: data.provider,
        apiKey: encryptedApiKey,
        isEnabled: data.isEnabled,
      },
    });

    // Decrypt API key for response
    let decryptedApiKey: string | null = null;
    if (config.apiKey) {
      try {
        decryptedApiKey = decrypt(config.apiKey);
      } catch (error) {
        console.error('Failed to decrypt API key:', error);
      }
    }

    return {
      id: config.id,
      tenantId: config.tenantId,
      provider: config.provider,
      apiKey: decryptedApiKey,
      isEnabled: config.isEnabled,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  }

  /**
   * Delete AI configuration
   */
  async deleteAIConfig(tenantId: string) {
    // Verify config exists
    const existingConfig = await prisma.aIConfig.findUnique({
      where: { tenantId },
    });

    if (!existingConfig) {
      throw new Error('AI_CONFIG_NOT_FOUND');
    }

    await prisma.aIConfig.delete({
      where: { tenantId },
    });

    return { success: true };
  }

  /**
   * Get API key for AI operations (either user-provided or platform key)
   */
  async getAPIKey(tenantId: string, provider: 'openai' | 'google'): Promise<string> {
    const config = await this.getAIConfig(tenantId);

    if (!config || !config.isEnabled) {
      throw new Error('AI_NOT_CONFIGURED');
    }

    // If using platform provider, use platform keys from environment
    if (config.provider === 'platform') {
      const platformKey =
        provider === 'openai'
          ? process.env.PLATFORM_OPENAI_API_KEY
          : process.env.PLATFORM_GOOGLE_AI_API_KEY;

      if (!platformKey) {
        throw new Error('PLATFORM_API_KEY_NOT_CONFIGURED');
      }

      return platformKey;
    }

    // If provider matches requested provider, use user's API key
    if (config.provider === provider && config.apiKey) {
      return config.apiKey;
    }

    throw new Error('AI_PROVIDER_MISMATCH');
  }
}

export const aiConfigService = new AIConfigService();

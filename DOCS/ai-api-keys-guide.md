# AI API Keys Setup Guide

This guide will walk you through obtaining API keys for OpenAI and Google Gemini to use with Worklamp's AI Assistant features.

## Table of Contents

- [OpenAI API Key](#openai-api-key)
- [Google Gemini API Key](#google-gemini-api-key)
- [Configuring Keys in Worklamp](#configuring-keys-in-worklamp)
- [Security Best Practices](#security-best-practices)

---

## OpenAI API Key

OpenAI provides access to GPT-4 and other powerful language models through their API.

### Prerequisites

- An OpenAI account
- A valid payment method (OpenAI requires billing information for API access)

### Step-by-Step Instructions

1. **Create an OpenAI Account**
   - Visit [https://platform.openai.com/signup](https://platform.openai.com/signup)
   - Sign up with your email address or use Google/Microsoft authentication
   - Verify your email address if required

2. **Set Up Billing**
   - Navigate to [https://platform.openai.com/account/billing](https://platform.openai.com/account/billing)
   - Click "Add payment method"
   - Enter your credit card information
   - Set up usage limits to control costs (recommended: start with $10-20/month)

3. **Generate an API Key**
   - Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Click "Create new secret key"
   - Give your key a descriptive name (e.g., "Worklamp AI Assistant")
   - **Important:** Copy the key immediately - you won't be able to see it again!
   - Store it securely (you'll need it for Worklamp configuration)

4. **Verify Your Key**
   - Your API key will look like: `sk-proj-...` (starts with `sk-`)
   - Keep this key confidential - treat it like a password

### Pricing Information

- OpenAI charges based on token usage (input + output)
- GPT-4 Turbo pricing (as of 2024):
  - Input: $0.01 per 1K tokens
  - Output: $0.03 per 1K tokens
- Monitor usage at: [https://platform.openai.com/usage](https://platform.openai.com/usage)
- Set up usage alerts to avoid unexpected charges

### Troubleshooting

**Issue:** "Insufficient quota" error

- **Solution:** Add credits to your OpenAI account or upgrade your plan

**Issue:** "Invalid API key" error

- **Solution:** Verify you copied the entire key, including the `sk-` prefix

**Issue:** Rate limit errors

- **Solution:** OpenAI has rate limits based on your tier. Upgrade your account or wait before retrying

---

## Google Gemini API Key

Google's Gemini models (including Gemini Pro) are available through Google AI Studio.

### Prerequisites

- A Google account
- Access to Google AI Studio (available in most regions)

### Step-by-Step Instructions

1. **Access Google AI Studio**
   - Visit [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
   - Or go to [https://aistudio.google.com](https://aistudio.google.com) and click "Get API key"
   - Sign in with your Google account

2. **Create a New API Key**
   - Click "Create API key" or "Get API key"
   - Choose "Create API key in new project" (recommended for first-time users)
   - Or select an existing Google Cloud project if you have one
   - The key will be generated immediately

3. **Copy Your API Key**
   - Your API key will be displayed on the screen
   - Click the copy button to copy it to your clipboard
   - **Important:** Store this key securely
   - You can always return to this page to view your keys

4. **Enable the Generative Language API** (if needed)
   - If prompted, enable the Generative Language API for your project
   - This is usually done automatically when creating the key

5. **Verify Your Key**
   - Your API key will look like: `AIza...` (starts with `AIza`)
   - Keep this key confidential

### Pricing Information

- Google Gemini offers a generous free tier:
  - **Gemini Pro**: 60 requests per minute (free)
  - **Gemini Pro Vision**: 60 requests per minute (free)
- Paid tier available for higher usage
- Monitor usage in Google Cloud Console
- Check current pricing: [https://ai.google.dev/pricing](https://ai.google.dev/pricing)

### Troubleshooting

**Issue:** "API key not valid" error

- **Solution:** Ensure you copied the entire key starting with `AIza`
- **Solution:** Check that the Generative Language API is enabled for your project

**Issue:** "Quota exceeded" error

- **Solution:** You've hit the free tier limit (60 requests/minute). Wait a minute or upgrade to paid tier

**Issue:** "Region not supported" error

- **Solution:** Google AI Studio may not be available in all regions. Consider using a VPN or OpenAI instead

**Issue:** Can't access Google AI Studio

- **Solution:** Ensure you're signed in with a Google account
- **Solution:** Check if the service is available in your region

---

## Configuring Keys in Worklamp

Once you have your API key(s), configure them in Worklamp:

1. **Navigate to AI Settings**
   - Click on your profile picture in the top right
   - Select "Profile"
   - Click on "AI Settings" in the Quick Links section

2. **Choose Your Provider**
   - **Platform**: Use Worklamp's API keys (if available with your subscription)
   - **OpenAI**: Use your own OpenAI API key
   - **Google AI**: Use your own Google Gemini API key

3. **Enter Your API Key**
   - Select your chosen provider from the dropdown
   - Paste your API key in the "API Key" field
   - The key will be encrypted and stored securely

4. **Enable AI Assistance**
   - Check the "Enable AI assistance" checkbox
   - Click "Create Configuration" or "Update Configuration"

5. **Test Your Configuration**
   - Navigate to a bug or feature request
   - Try using the AI Assistant features to verify it's working

---

## Security Best Practices

### Protecting Your API Keys

1. **Never Share Your Keys**
   - Treat API keys like passwords
   - Don't commit them to version control
   - Don't share them in chat, email, or screenshots

2. **Use Key Restrictions** (Google only)
   - In Google Cloud Console, restrict your API key to specific APIs
   - Set up application restrictions if possible

3. **Monitor Usage**
   - Regularly check your API usage dashboards
   - Set up billing alerts to catch unusual activity
   - Review usage patterns for anomalies

4. **Rotate Keys Regularly**
   - Generate new keys periodically (every 3-6 months)
   - Delete old keys after rotation
   - Update Worklamp with the new key

5. **Set Usage Limits**
   - Configure spending limits in OpenAI dashboard
   - Use Google Cloud quotas to limit requests
   - Monitor costs to avoid surprises

### If Your Key is Compromised

**Immediate Actions:**

1. **Revoke the Key**
   - OpenAI: Delete the key at [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Google: Delete the key at [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)

2. **Generate a New Key**
   - Follow the steps above to create a new key
   - Update Worklamp with the new key

3. **Review Usage**
   - Check for unauthorized usage in your billing dashboard
   - Contact support if you see suspicious activity

4. **Update Billing Alerts**
   - Set up or lower spending limits
   - Enable email notifications for unusual activity

---

## Additional Resources

### OpenAI

- [OpenAI Platform Documentation](https://platform.openai.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [OpenAI Community Forum](https://community.openai.com)
- [OpenAI Status Page](https://status.openai.com)

### Google Gemini

- [Google AI Studio](https://aistudio.google.com)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Google AI Developer Forum](https://discuss.ai.google.dev)
- [Google Cloud Status](https://status.cloud.google.com)

### Worklamp Support

- For issues with Worklamp's AI integration, contact your administrator
- Check the Worklamp documentation for feature-specific guides

---

## Frequently Asked Questions

**Q: Which provider should I choose?**
A:

- **OpenAI (GPT-4)**: Generally more capable, better for complex tasks, higher cost
- **Google Gemini**: Good performance, generous free tier, lower cost
- **Platform**: Easiest option if available with your subscription (no key management needed)

**Q: How much will this cost me?**
A:

- **Google Gemini**: Free tier covers most individual usage (60 requests/minute)
- **OpenAI**: Costs vary based on usage, typically $5-20/month for moderate use
- Start with low limits and adjust based on your needs

**Q: Can I use both providers?**
A: Worklamp currently supports one provider at a time per tenant. You can switch providers by updating your configuration.

**Q: Is my API key secure in Worklamp?**
A: Yes, API keys are encrypted at rest using industry-standard encryption (AES-256-GCM) and are never exposed in logs or API responses.

**Q: What happens if I run out of credits?**
A: The AI features will stop working until you add more credits to your account. You'll receive error messages indicating quota or billing issues.

**Q: Can I share my API key with my team?**
A: The API key is configured at the tenant level, so all team members will use the same key. Monitor usage to ensure it stays within your budget.

---

**Last Updated:** December 2024

For the most current information, always refer to the official OpenAI and Google documentation linked above.

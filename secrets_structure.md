# Secrets Structure for Aventuras Lingüísticas

This document outlines the structure and format of the secrets required for the Microsoft Azure Speech Service integration in the Aventuras Lingüísticas project.

## GitHub Secrets Configuration

The following secrets need to be added to your GitHub repository:

| Secret Name | Description | Source in Azure Portal |
|-------------|-------------|------------------------|
| `SPEECH_API_KEY` | Azure Speech Service API key | Azure Portal > Speech Service > Keys and Endpoint > Key 1 or Key 2 |
| `SPEECH_REGION` | Azure Speech Service region | Azure Portal > Speech Service > Keys and Endpoint > Location/Region |
| `AVENTURASSPEECH_SUBSCRIPTION_ID` | Azure Subscription ID | Azure Portal > Subscriptions > Subscription ID |

## How to Obtain These Secrets

### 1. Navigate to Your Azure Speech Service Resource

- Log into the [Azure Portal](https://portal.azure.com)
- Navigate to your "AventurasSpeech" resource in the "WestUS" location
- If you don't see it, search for "Speech services" in the search bar

### 2. Get the API Key

- In the left sidebar menu of your Speech service, click on **Keys and Endpoint**
- You'll see two keys (Key 1 and Key 2) - you can use either one
- Copy the key value (it will look something like `a1b2c3d4e5f6g7h8i9j0...`)

### 3. Get the Region

- On the same page, look for the **Location/Region** value
- For your service in WestUS, the region value should be `westus`
- Note: Use the region identifier (e.g., `westus`), not the display name (e.g., "West US")

## Adding Secrets to GitHub

1. Go to your GitHub repository
2. Click on **Settings**
3. In the left sidebar, click on **Secrets and variables** > **Actions**
4. Click on **New repository secret**
5. Add each secret with its exact name and value:

```
Name: SPEECH_API_KEY
Secret: <your-api-key-from-azure>
```

```
Name: SPEECH_REGION
Secret: westus
```

```
Name: AVENTURASSPEECH_SUBSCRIPTION_ID
Secret: <your-azure-subscription-id>
```

## Using the Secrets Locally (Development)

For local development, you can create a `config.production.js` file based on the existing `config.js`:

```javascript
// File: public/js/config.production.js
window.SPEECH_CONFIG = {
  apiKey: 'your-api-key-from-azure',
  region: 'westus',
  voiceName: 'es-ES-ElviraNeural',
  fallbackVoiceName: 'es-ES-AlvaroNeural',
  pitch: 0,
  rate: 1.0,
  useSSML: false,
  useFallbackVoices: true
};
```

**IMPORTANT**: Never commit this file to the repository. It is already listed in `.gitignore`.

## Verifying Secret Configuration

To verify that your secrets are correctly configured in GitHub:

1. Push a change to the main branch
2. Go to the **Actions** tab in your repository
3. Click on the running workflow
4. Check that it completes without errors

The workflow will:
1. Create a `config.production.js` file with your secrets injected
2. Replace the reference to `config.js` with `config.production.js` in the HTML
3. Deploy the site to GitHub Pages

## Supported Voice Options

The Azure Speech Service offers several Spanish voices. The best options are:

| Voice Name | Gender | Voice Type | Description |
|------------|--------|------------|-------------|
| `es-ES-ElviraNeural` | Female | Neural | High-quality female voice (default) |
| `es-ES-AlvaroNeural` | Male | Neural | High-quality male voice (fallback) |
| `es-ES-AbrilNeural` | Female | Neural | Alternative female voice |
| `es-ES-ArnauNeural` | Male | Neural | Alternative male voice |
| `es-ES-EstrellaNeural` | Female | Neural | Child-like female voice |
| `es-ES-ThiagoNeural` | Male | Neural | Child-like male voice |

You can change the default voice in the GitHub workflow file (`.github/workflows/deploy.yml`) if desired.

## Subscription Information

Your Azure Speech Service:
- Name: AventurasSpeech
- Location: WestUS
- Subscription ID: While not directly needed for the API connection, we store it as `AVENTURASSPEECH_SUBSCRIPTION_ID` for potential future usage with other Azure services or for billing/tracking purposes

## Troubleshooting

If you encounter issues with the Speech Service:

1. Verify that the API key is correct and active
2. Confirm that the region matches where your service is deployed (should be `westus`)
3. Check for any API usage limitations or quotas in the Azure Portal
4. Look for error messages in the browser console
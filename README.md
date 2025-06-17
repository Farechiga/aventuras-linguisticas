# ¡Aventuras Lingüísticas!

A Spanish language learning game that helps users practice Spanish vocabulary and sentence structure.

## Features

- Multiple game modes to practice Spanish
- Speech synthesis for pronunciation
- Interactive matching exercises
- Progressive difficulty levels

## Setup

### Prerequisites

- Modern web browser with JavaScript enabled
- Microsoft Speech Services API key (for premium voices)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/Aventuras-linguisticas.git
cd Aventuras-linguisticas
```

2. Set up the Microsoft Speech Services API:
   - Sign up for a [Microsoft Azure account](https://azure.microsoft.com/)
   - Create a Speech Services resource in the Azure portal
   - Copy your API key and region

3. Configure your API keys:
   - Create a copy of `public/js/config.js` named `public/js/config.production.js`
   - Add your API key and region to `config.production.js`:
   ```javascript
   window.SPEECH_CONFIG = {
     apiKey: 'your-api-key-here',
     region: 'your-region-here', // e.g., 'westus'
     voiceName: 'es-ES-ElviraNeural'
   };
   ```

4. Deploy to GitHub Pages (optional):
   - Push your changes to GitHub
   - Enable GitHub Pages in your repository settings
   - Your site will be available at `https://yourusername.github.io/Aventuras-linguisticas/`

## Using GitHub Secrets for API Key Management

For secure deployment with GitHub Actions:

1. In your GitHub repository, go to Settings > Secrets and variables > Actions
2. Add a new repository secret:
   - Name: `SPEECH_API_KEY`
   - Value: Your Microsoft Speech Services API key
3. Add another secret:
   - Name: `SPEECH_REGION`
   - Value: Your Microsoft Speech Services region

4. Create a GitHub Actions workflow file (`.github/workflows/deploy.yml`):
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Create config with API keys
        run: |
          echo "window.SPEECH_CONFIG = {" > public/js/config.production.js
          echo "  apiKey: '${{ secrets.SPEECH_API_KEY }}'," >> public/js/config.production.js
          echo "  region: '${{ secrets.SPEECH_REGION }}'," >> public/js/config.production.js
          echo "  voiceName: 'es-ES-ElviraNeural'," >> public/js/config.production.js
          echo "  fallbackVoiceName: 'es-ES-AlvaroNeural'" >> public/js/config.production.js
          echo "};" >> public/js/config.production.js
      
      - name: Deploy to GitHub Pages
        uses: JamesIves/github-pages-deploy-action@4.1.5
        with:
          branch: gh-pages
          folder: public
```

5. Push your changes to GitHub, and the workflow will automatically deploy your site with the API keys securely included.

## License

[MIT License](LICENSE)

## Credits

- Created by [Your Name]
- Spanish voice services provided by Microsoft Speech Services
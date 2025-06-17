# Microsoft Speech SDK Integration Guide

This document provides instructions on how to integrate the Microsoft Speech SDK into the Aventuras Lingüísticas project once you have your API key.

## 1. Add the Microsoft Speech SDK to your project

Add the Microsoft Speech SDK to your project by including it in your HTML:

```html
<!-- Add this before the other script tags in index.html -->
<script src="https://aka.ms/csspeech/jsbrowserpackageraw"></script>
```

## 2. Update speech.js to use the Microsoft Speech SDK

Replace the placeholder implementation in `speech.js` with the following code:

```javascript
// Microsoft Speech Services Integration

// Configuration - Values will be loaded from environment variables
const speechConfig = {
  apiKey: '', // Will be populated from environment variable
  region: '', // Will be populated from environment variable
  language: 'es-ES', // Default language for Spanish
  voiceName: 'es-ES-ElviraNeural', // Default voice (female, neural)
  pitch: 0, // Default pitch (range: -100 to 100)
  rate: 1.0 // Default speaking rate (range: 0.5 to 2)
};

// Speech synthesis instance
let speechSynthesizer = null;
let microsoftSpeechConfig = null;

// Initialize the speech synthesis module using Web Speech API
async function initWebSpeechAPI() {
  try {
    if (!('speechSynthesis' in window)) {
      console.error('Speech synthesis not supported in this browser');
      return null;
    }
    
    console.log('Speech synthesis initialized using Web Speech API');
    
    return {
      speak: function(text, options = {}) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = options.language || speechConfig.language;
        utterance.pitch = (options.pitch !== undefined) ? options.pitch : speechConfig.pitch;
        utterance.rate = (options.rate !== undefined) ? options.rate : speechConfig.rate;
        
        // Set voice if available
        const voices = window.speechSynthesis.getVoices();
        const spanishVoices = voices.filter(voice => voice.lang.startsWith('es'));
        if (spanishVoices.length > 0) {
          utterance.voice = spanishVoices[0];
        }
        
        console.log(`Speaking: "${text}" in ${utterance.lang}`);
        window.speechSynthesis.speak(utterance);
        
        return new Promise((resolve) => {
          utterance.onend = () => resolve();
        });
      },
      pause: function() {
        window.speechSynthesis.pause();
      },
      resume: function() {
        window.speechSynthesis.resume();
      },
      cancel: function() {
        window.speechSynthesis.cancel();
      }
    };
  } catch (error) {
    console.error('Error initializing Web Speech API:', error);
    return null;
  }
}

// Initialize Microsoft Speech Services
async function initMicrosoftSpeechServices() {
  try {
    // Check if SDK is available
    if (!window.SpeechSDK) {
      console.warn('Microsoft Speech SDK not loaded. Falling back to Web Speech API.');
      return await initWebSpeechAPI();
    }
    
    // Check if API key and region are available
    if (!speechConfig.apiKey || !speechConfig.region) {
      console.warn('Microsoft Speech Services API key or region not provided. Falling back to Web Speech API.');
      return await initWebSpeechAPI();
    }
    
    // Create speech config
    microsoftSpeechConfig = SpeechSDK.SpeechConfig.fromSubscription(
      speechConfig.apiKey, 
      speechConfig.region
    );
    
    // Set default speech synthesis language and voice
    microsoftSpeechConfig.speechSynthesisLanguage = speechConfig.language;
    microsoftSpeechConfig.speechSynthesisVoiceName = speechConfig.voiceName;
    
    console.log('Microsoft Speech Services initialized successfully');
    
    return {
      speak: function(text, options = {}) {
        return new Promise((resolve, reject) => {
          try {
            // Create synthesizer
            const synthesizer = new SpeechSDK.SpeechSynthesizer(microsoftSpeechConfig);
            
            // Set language and voice if provided in options
            if (options.language) {
              microsoftSpeechConfig.speechSynthesisLanguage = options.language;
            }
            if (options.voiceName) {
              microsoftSpeechConfig.speechSynthesisVoiceName = options.voiceName;
            }
            
            // Define SSML for more control if needed
            let ssml = '';
            if (speechConfig.useSSML) {
              // Create SSML with prosody controls
              const rate = options.rate ? options.rate : speechConfig.rate;
              const pitch = options.pitch ? options.pitch : speechConfig.pitch;
              
              ssml = `
                <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${options.language || speechConfig.language}">
                  <voice name="${options.voiceName || speechConfig.voiceName}">
                    <prosody rate="${rate}" pitch="${pitch}%">
                      ${text}
                    </prosody>
                  </voice>
                </speak>`;
              
              console.log(`Speaking with SSML: "${text}"`);
              synthesizer.speakSsmlAsync(
                ssml,
                result => {
                  synthesizer.close();
                  resolve();
                },
                error => {
                  console.error('Speech synthesis error:', error);
                  synthesizer.close();
                  reject(error);
                }
              );
            } else {
              // Simple text-to-speech
              console.log(`Speaking: "${text}"`);
              synthesizer.speakTextAsync(
                text,
                result => {
                  synthesizer.close();
                  resolve();
                },
                error => {
                  console.error('Speech synthesis error:', error);
                  synthesizer.close();
                  reject(error);
                }
              );
            }
          } catch (error) {
            console.error('Error in speak function:', error);
            reject(error);
          }
        });
      },
      pause: function() {
        // Not directly supported in Microsoft Speech SDK
        console.log('Pause not supported with Microsoft Speech SDK');
      },
      resume: function() {
        // Not directly supported in Microsoft Speech SDK
        console.log('Resume not supported with Microsoft Speech SDK');
      },
      cancel: function() {
        // Would need to close the synthesizer
        console.log('Speech canceled');
      }
    };
  } catch (error) {
    console.error('Error initializing Microsoft Speech Services:', error);
    return await initWebSpeechAPI();
  }
}

// Speech recognition using Microsoft Speech SDK
function startMicrosoftSpeechRecognition(callback, language = speechConfig.language) {
  try {
    if (!window.SpeechSDK || !speechConfig.apiKey || !speechConfig.region) {
      return startWebSpeechRecognition(callback, language);
    }
    
    const recognitionConfig = SpeechSDK.SpeechConfig.fromSubscription(
      speechConfig.apiKey, 
      speechConfig.region
    );
    recognitionConfig.speechRecognitionLanguage = language;
    
    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new SpeechSDK.SpeechRecognizer(recognitionConfig, audioConfig);
    
    recognizer.recognizeOnceAsync(
      result => {
        const transcript = result.text;
        console.log(`Recognized: ${transcript}`);
        callback(transcript);
        recognizer.close();
      },
      error => {
        console.error('Speech recognition error:', error);
        recognizer.close();
      }
    );
    
    console.log(`Started Microsoft speech recognition in ${language}`);
    return recognizer;
  } catch (error) {
    console.error('Error starting Microsoft speech recognition:', error);
    return startWebSpeechRecognition(callback, language);
  }
}

// Speech recognition using Web Speech API as fallback
function startWebSpeechRecognition(callback, language = speechConfig.language) {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    console.error('Speech recognition not supported in this browser');
    return null;
  }
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  
  recognition.lang = language;
  recognition.continuous = false;
  recognition.interimResults = false;
  
  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    console.log(`Recognized: ${transcript}`);
    callback(transcript);
  };
  
  recognition.onerror = function(event) {
    console.error('Speech recognition error:', event.error);
  };
  
  recognition.start();
  console.log(`Started web speech recognition in ${language}`);
  
  return recognition;
}

function stopSpeechRecognition(recognition) {
  if (recognition) {
    if (typeof recognition.close === 'function') {
      recognition.close(); // Microsoft SDK
    } else if (typeof recognition.stop === 'function') {
      recognition.stop(); // Web Speech API
    }
    console.log('Stopped speech recognition');
  }
}

// Load configuration from environment variables
async function loadSpeechConfig() {
  try {
    // In production, this would load from environment variables
    // For development, we'll check for a configuration object
    if (window.SPEECH_CONFIG) {
      speechConfig.apiKey = window.SPEECH_CONFIG.apiKey || '';
      speechConfig.region = window.SPEECH_CONFIG.region || '';
      
      // Optional settings
      if (window.SPEECH_CONFIG.voiceName) {
        speechConfig.voiceName = window.SPEECH_CONFIG.voiceName;
      }
      if (window.SPEECH_CONFIG.pitch !== undefined) {
        speechConfig.pitch = window.SPEECH_CONFIG.pitch;
      }
      if (window.SPEECH_CONFIG.rate !== undefined) {
        speechConfig.rate = window.SPEECH_CONFIG.rate;
      }
      if (window.SPEECH_CONFIG.useSSML !== undefined) {
        speechConfig.useSSML = window.SPEECH_CONFIG.useSSML;
      }
      
      console.log('Speech configuration loaded from window.SPEECH_CONFIG');
    }
    
    return speechConfig;
  } catch (error) {
    console.error('Error loading speech configuration:', error);
    return speechConfig;
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
  await loadSpeechConfig();
  speechSynthesizer = await initMicrosoftSpeechServices();
  
  // Expose the speech services to the global scope for use in game.js
  window.speechServices = {
    speak: function(text, options) {
      if (speechSynthesizer) {
        return speechSynthesizer.speak(text, options);
      }
      return Promise.resolve();
    },
    startSpeechRecognition: function(callback, language) {
      return startMicrosoftSpeechRecognition(callback, language);
    },
    stopSpeechRecognition: stopSpeechRecognition
  };
  
  console.log('Speech services initialized and ready');
});
```

## 3. Update index.html to include the Microsoft Speech SDK

Update your `index.html` file to include the Microsoft Speech SDK:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>¡Aventuras lingüísticas!</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <div class="game-container">
        <!-- Game content -->
    </div>
    
    <!-- Scripts -->
    <script src="https://aka.ms/csspeech/jsbrowserpackageraw"></script>
    <script src="js/config.js"></script>
    <script src="js/speech.js"></script>
    <script src="js/game.js"></script>
</body>
</html>
```

## 4. Testing Microsoft Speech Services

To test if your Microsoft Speech Services integration is working:

1. Make sure your API key and region are set in `config.js` or `config.production.js`
2. Open the browser console and look for "Microsoft Speech Services initialized successfully"
3. Try using the speech functions in the game to see if the premium voices are being used

## 5. Troubleshooting

If you encounter issues with the Microsoft Speech SDK:

- Check that your API key and region are correct
- Ensure you have sufficient credits in your Azure account
- Look for any CORS-related errors in the console
- Try testing with a simple example from the Microsoft Speech SDK documentation

For more information, visit the [Microsoft Speech Services documentation](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/).
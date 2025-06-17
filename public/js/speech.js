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

// Initialize the speech synthesis module
async function initSpeechSynthesis() {
  try {
    // In a production environment, this would use the Microsoft Speech SDK
    // For now, we'll use the Web Speech API as a fallback
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
    console.error('Error initializing speech synthesis:', error);
    return null;
  }
}

// Initialize Microsoft Speech Services
async function initMicrosoftSpeechServices() {
  try {
    // This would initialize the Microsoft Speech SDK
    // We'll need to replace this with actual implementation when API keys are available
    console.log('Microsoft Speech Services would be initialized here');
    
    // Return the speech synthesis interface
    return await initSpeechSynthesis();
  } catch (error) {
    console.error('Error initializing Microsoft Speech Services:', error);
    // Fall back to Web Speech API
    return await initSpeechSynthesis();
  }
}

// Speech recognition using Web Speech API as fallback
function startSpeechRecognition(callback, language = speechConfig.language) {
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
  console.log(`Started speech recognition in ${language}`);
  
  return recognition;
}

function stopSpeechRecognition(recognition) {
  if (recognition) {
    recognition.stop();
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
    startSpeechRecognition: startSpeechRecognition,
    stopSpeechRecognition: stopSpeechRecognition
  };
  
  console.log('Speech services initialized and ready');
});
// Configuration file for API keys and settings
// This file should be replaced with environment variables in production

// Speech services configuration
window.SPEECH_CONFIG = {
  apiKey: '', // Replace with your Microsoft Speech Services API key
  region: '', // Replace with your region (e.g., 'westus')
  
  // Optional settings
  voiceName: 'es-ES-ElviraNeural', // Neural female voice (premium)
  fallbackVoiceName: 'es-ES-AlvaroNeural', // Neural male voice (premium)
  
  // Speech settings
  pitch: 0, // Default pitch (range: -100 to 100)
  rate: 1.0, // Default speaking rate (range: 0.5 to 2)
  
  // Additional settings
  useSSML: false, // Set to true to enable SSML for advanced pronunciation control
  useFallbackVoices: true // Use browser's built-in voices if Microsoft services unavailable
};
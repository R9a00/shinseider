// Frontend configuration
const config = {
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 
    (process.env.NODE_ENV === 'production' ? 
     'https://shinseider-api-v1.onrender.com' : 
     'http://localhost:8888'),
  
  // Development mode check
  isDevelopment: process.env.NODE_ENV === 'development',
  
  // Feature flags
  FEATURES: {
    DEBUG_MODE: process.env.REACT_APP_DEBUG_MODE === 'true',
    MOCK_API: process.env.REACT_APP_MOCK_API === 'true',
  }
};

export default config;
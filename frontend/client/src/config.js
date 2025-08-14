// Frontend configuration
const config = {
  // API Base URL - 環境変数で設定可能、デフォルトは環境に応じて自動選択
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 
    (process.env.NODE_ENV === 'production' ? 
     'https://shinseider-api.onrender.com' : 
     'http://localhost:8888'),
  
  // Development mode check
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // Feature flags
  FEATURES: {
    DEBUG_MODE: process.env.REACT_APP_DEBUG_MODE === 'true',
    MOCK_API: process.env.REACT_APP_MOCK_API === 'true',
  },
  
};

export default config;
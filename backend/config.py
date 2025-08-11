import os
from typing import List

class Settings:
    """Application configuration settings."""
    
    # Server Configuration
    PORT: int = int(os.getenv("BACKEND_PORT", "8888"))
    HOST: str = os.getenv("BACKEND_HOST", "localhost")
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # CORS Configuration
    CORS_ORIGINS: List[str] = [
        os.getenv("CORS_ORIGIN", "http://localhost:3333"),
    ]
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    ALLOWED_HOSTS: List[str] = os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    # File paths
    SUBSIDIES_CONFIG_PATH: str = os.path.join(os.path.dirname(__file__), "subsidies.yaml")
    TEMP_FILES_DIR: str = os.path.join(os.path.dirname(__file__), "temp_files")
    LOG_CONFIG_PATH: str = os.path.join(os.path.dirname(__file__), "log_config.yaml")

# Global settings instance
settings = Settings()
from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App
    app_env: str = "development"
    debug: bool = True

    # Database
    database_url: str = "sqlite+aiosqlite:///./nepaljobai.db"

    # CORS
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
    ]

    # Clerk
    clerk_secret_key: str = ""
    clerk_webhook_secret: str = ""

    # Hugging Face
    hf_api_token: str = ""
    hf_embedding_model: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    hf_ner_model: str = "ai4bharat/IndicBERT"

    # OpenRouter (Llama 3.3 70B for roadmap generation)
    openrouter_api_key: str = ""
    openrouter_model: str = "meta-llama/llama-3.3-70b-instruct:free"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # Celery
    celery_broker_url: str = "redis://localhost:6379/0"
    celery_result_backend: str = "redis://localhost:6379/0"

    # Frontend URL — used in CORS allow-list for the production Vercel deployment
    frontend_url: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
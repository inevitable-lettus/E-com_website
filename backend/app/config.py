from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://useless:useless123@localhost:5432/useless_db"
    REDIS_URL: str = "redis://localhost:6379"
    SECRET_KEY: str = "dev_secret_key_change_in_production_min_32_chars!!"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/auth/google/callback"

    FRONTEND_URL: str = "http://localhost:5173"
    UPLOAD_DIR: str = "uploads"

    PENALTY_PER_DAY: float = 50.0  # ₹50/day overdue

    class Config:
        env_file = ".env"


settings = Settings()

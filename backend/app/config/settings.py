from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "InterviewIQ AI"
    debug: bool = True
    database_url: str = "sqlite:///./interviewiq.db"


settings = Settings()

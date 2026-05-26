from pydantic import BaseModel


class ReportCreate(BaseModel):
    interview_id: str
    summary: str

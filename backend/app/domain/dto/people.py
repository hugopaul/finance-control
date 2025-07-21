from pydantic import BaseModel, validator
from datetime import datetime
from typing import Optional
import uuid

class PeopleDTO(BaseModel):
    id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    relationship: str
    color: str = "bg-blue-500"
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    @validator('id', pre=True)
    def convert_uuid_to_str(cls, v):
        if isinstance(v, uuid.UUID):
            return str(v)
        return v
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class PeopleCreateDTO(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    relationship: str
    color: Optional[str] = "bg-blue-500"
    notes: Optional[str] = None

class PeopleUpdateDTO(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    relationship: Optional[str] = None
    color: Optional[str] = None
    notes: Optional[str] = None 
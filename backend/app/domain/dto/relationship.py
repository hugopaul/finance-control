from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class RelationshipDTO(BaseModel):
    id: str
    name: str
    icon: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class RelationshipCreateDTO(BaseModel):
    id: str
    name: str
    icon: Optional[str] = None 
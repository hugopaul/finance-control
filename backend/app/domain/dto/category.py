from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class CategoryDTO(BaseModel):
    id: str
    name: str
    icon: Optional[str] = None
    color: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
        json_encoders={
            datetime: lambda v: v.isoformat()
        }
    )

class CategoryCreateDTO(BaseModel):
    id: str
    name: str
    icon: Optional[str] = None
    color: Optional[str] = None

class CategoryUpdateDTO(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None 
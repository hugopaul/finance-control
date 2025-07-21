from pydantic import BaseModel, field_validator, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID

class UserDTO(BaseModel):
    id: str
    name: str
    email: str
    avatar: Optional[str]
    created_at: datetime
    updated_at: datetime

    @field_validator('id', mode='before')
    @classmethod
    def convert_uuid_to_string(cls, v):
        if isinstance(v, UUID):
            return str(v)
        return v

    model_config = ConfigDict(
        from_attributes=True,
        json_encoders={
            datetime: lambda v: v.isoformat()
        }
    )

class UserCreateDTO(BaseModel):
    name: str
    email: str
    password: str
    confirmPassword: str
    avatar: Optional[str] = None

class UserLoginDTO(BaseModel):
    email: str
    password: str 
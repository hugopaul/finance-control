from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class PaymentMethodDTO(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None

    class Config:
        json_encoders = {
            UUID: lambda v: str(v)
        }

class PaymentMethodCreateDTO(BaseModel):
    name: str
    description: Optional[str] = None

class PaymentMethodUpdateDTO(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None 
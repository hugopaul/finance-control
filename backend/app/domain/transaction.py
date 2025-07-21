from pydantic import BaseModel, field_validator, ConfigDict
from typing import Optional
from datetime import date, datetime
from uuid import UUID

class TransactionCreateDTO(BaseModel):
    description: str
    amount: float
    type: str
    category: str
    date: date
    is_recurring: Optional[bool] = False
    installments: Optional[int] = None
    total_installments: Optional[int] = None
    due_date: Optional[date] = None

class TransactionUpdateDTO(BaseModel):
    description: Optional[str]
    amount: Optional[float]
    type: Optional[str]
    category: Optional[str]
    date: Optional[date]
    is_recurring: Optional[bool]
    installments: Optional[int]
    total_installments: Optional[int]
    due_date: Optional[date]

class TransactionOutDTO(BaseModel):
    id: str
    user_id: str
    description: str
    amount: float
    type: str
    category: str
    date: date
    is_recurring: bool
    installments: Optional[int]
    total_installments: Optional[int]
    due_date: Optional[date]
    created_at: datetime
    updated_at: datetime

    @field_validator('id', 'user_id', mode='before')
    @classmethod
    def convert_uuid_to_string(cls, v):
        if isinstance(v, UUID):
            return str(v)
        return v

    model_config = ConfigDict(
        from_attributes=True,
        json_encoders={
            date: lambda v: v.isoformat(),
            datetime: lambda v: v.isoformat()
        }
    ) 
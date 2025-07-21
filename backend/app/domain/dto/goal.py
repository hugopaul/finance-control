from pydantic import BaseModel, field_validator, ConfigDict
from typing import Optional
from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

class GoalDTO(BaseModel):
    id: str
    title: str
    target_amount: Decimal
    current_amount: Decimal
    deadline: Optional[date] = None
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    @field_validator('id', mode='before')
    @classmethod
    def convert_uuid_to_str(cls, v):
        if isinstance(v, UUID):
            return str(v)
        return v

    @field_validator('target_amount', 'current_amount', mode='before')
    @classmethod
    def convert_decimal_to_float(cls, v):
        if isinstance(v, Decimal):
            return float(v)
        return v

    model_config = ConfigDict(
        from_attributes=True,
        json_encoders={
            datetime: lambda v: v.isoformat(),
            date: lambda v: v.isoformat(),
            Decimal: lambda v: float(v)
        }
    )

class GoalCreateDTO(BaseModel):
    title: str
    target_amount: float
    deadline: Optional[date] = None
    description: Optional[str] = None

class GoalUpdateDTO(BaseModel):
    title: Optional[str] = None
    target_amount: Optional[float] = None
    deadline: Optional[date] = None
    description: Optional[str] = None 
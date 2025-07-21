from pydantic import BaseModel, field_validator, ConfigDict
from typing import Optional
from datetime import datetime, date
from decimal import Decimal
from uuid import UUID

class TransactionDTO(BaseModel):
    id: str
    user_id: str
    description: str
    amount: Decimal
    type: str
    category: str
    date: date
    is_recurring: bool
    installments: Optional[int] = None
    total_installments: Optional[int] = None
    due_date: Optional[date] = None
    created_at: datetime
    updated_at: datetime
    payment_method_id: Optional[str] = None

    @field_validator('id', 'user_id', 'payment_method_id', mode='before')
    @classmethod
    def convert_uuid_to_str(cls, v):
        if isinstance(v, UUID):
            return str(v)
        return v

    @field_validator('amount', mode='before')
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
            Decimal: lambda v: float(v),
            UUID: lambda v: str(v)
        }
    )

class TransactionCreateDTO(BaseModel):
    description: str
    amount: float
    type: str
    category: str
    date: date
    is_recurring: bool = False
    installments: Optional[int] = None
    total_installments: Optional[int] = None
    due_date: Optional[date] = None
    payment_method_id: Optional[str] = None

    @field_validator('payment_method_id', mode='before')
    @classmethod
    def validate_payment_method_required(cls, v, values):
        # Pydantic v2: values é ValidationInfo, acessar via values.data
        if getattr(values, 'data', {}).get('type') == 'expense' and not v:
            raise ValueError('Forma de pagamento é obrigatória para transações do tipo despesa')
        return v

class TransactionUpdateDTO(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = None
    type: Optional[str] = None
    category: Optional[str] = None
    date: date
    is_recurring: Optional[bool] = None
    installments: Optional[int] = None
    total_installments: Optional[int] = None
    due_date: Optional[date] = None
    payment_method_id: Optional[str] = None 
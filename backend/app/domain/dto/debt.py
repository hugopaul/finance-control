from pydantic import BaseModel, validator, field_validator
from datetime import datetime, date
from typing import Optional
from decimal import Decimal
import uuid
from .people import PeopleDTO

class DebtDTO(BaseModel):
    id: str
    description: str
    amount: Decimal
    paid_amount: Decimal
    status: str
    date: date
    due_date: Optional[date] = None
    installments: Optional[int] = None
    total_installments: Optional[int] = None
    person_id: str
    person: PeopleDTO
    created_at: datetime
    updated_at: datetime
    payment_method_id: Optional[str] = None

    @validator('id', 'person_id', 'payment_method_id', pre=True)
    def convert_uuid_to_str(cls, v):
        if isinstance(v, uuid.UUID):
            return str(v)
        return v

    @validator('amount', 'paid_amount', pre=True)
    def convert_decimal_to_float(cls, v):
        if isinstance(v, Decimal):
            return float(v)
        return v

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            date: lambda v: v.isoformat(),
            Decimal: lambda v: float(v),
            uuid.UUID: lambda v: str(v)
        }

class DebtCreateDTO(BaseModel):
    description: str
    amount: float
    date: date
    due_date: Optional[date] = None
    installments: Optional[int] = None
    total_installments: Optional[int] = None
    person_id: str
    payment_method_id: Optional[str] = None

    @validator('amount')
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError('O valor da dívida deve ser positivo')
        return v

    @validator('total_installments')
    def validate_total_installments(cls, v):
        if v is not None and v < 1:
            raise ValueError('O número total de parcelas deve ser maior ou igual a 1')
        return v

    @validator('installments', 'total_installments')
    def validate_installments_consistency(cls, v, values):
        if 'installments' in values and 'total_installments' in values:
            installments = values.get('installments')
            total_installments = values.get('total_installments')
            if installments and total_installments and installments > total_installments:
                raise ValueError('A parcela atual não pode ser maior que o total de parcelas')
        return v

    model_config = {"extra": "allow"}

class DebtUpdateDTO(BaseModel):
    description: str
    amount: float
    date: date
    due_date: Optional[date] = None
    installments: Optional[int] = None
    total_installments: Optional[int] = None
    person_id: str
    payment_method_id: Optional[str] = None
    status: Optional[str] = None
    paid_amount: Optional[float] = None

    @validator('amount')
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError('O valor da dívida deve ser positivo')
        return v

    @validator('total_installments')
    def validate_total_installments(cls, v):
        if v is not None and v < 1:
            raise ValueError('O número total de parcelas deve ser maior ou igual a 1')
        return v

    @validator('installments', 'total_installments')
    def validate_installments_consistency(cls, v, values):
        if 'installments' in values and 'total_installments' in values:
            installments = values.get('installments')
            total_installments = values.get('total_installments')
            if installments and total_installments and installments > total_installments:
                raise ValueError('A parcela atual não pode ser maior que o total de parcelas')
        return v

    model_config = {"extra": "allow"}

class DebtPaymentDTO(BaseModel):
    paid_amount: float 
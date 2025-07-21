import uuid
from sqlalchemy import Column, String, Date, DateTime, func, ForeignKey, DECIMAL, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from ..db import Base

class DebtsModel(Base):
    __tablename__ = "debts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    person_id = Column(UUID(as_uuid=True), ForeignKey("people.id", ondelete="CASCADE"), nullable=False)
    description = Column(String(200), nullable=False)
    amount = Column(DECIMAL(10, 2), nullable=False)
    paid_amount = Column(DECIMAL(10, 2), default=0)
    status = Column(String(20), default="pending")
    date = Column(Date, nullable=False)
    due_date = Column(Date)
    installments = Column(Integer)
    total_installments = Column(Integer)
    payment_method_id = Column(UUID(as_uuid=True), ForeignKey("payment_methods.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())
    
    # Relacionamentos
    person = relationship("PeopleModel", backref="debts") 
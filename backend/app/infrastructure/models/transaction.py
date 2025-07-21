from sqlalchemy import Column, String, TIMESTAMP, text, Integer, Numeric, Boolean, ForeignKey, Date
from sqlalchemy.orm import relationship
import uuid
from ..db import Base

class TransactionModel(Base):
    __tablename__ = "transactions"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    description = Column(String(200), nullable=False)
    amount = Column(Numeric(10,2), nullable=False)
    type = Column(String(10), nullable=False)
    category = Column(String(50), ForeignKey("categories.id"), nullable=False)
    date = Column(Date, nullable=False)
    is_recurring = Column(Boolean, default=False)
    installments = Column(Integer, nullable=True)
    total_installments = Column(Integer, nullable=True)
    due_date = Column(Date, nullable=True)
    payment_method_id = Column(String, ForeignKey("payment_methods.id"), nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(TIMESTAMP(timezone=True), server_default=text("CURRENT_TIMESTAMP"))

    category_rel = relationship("CategoryModel") 
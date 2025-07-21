import uuid
from sqlalchemy import Column, String, Date, DateTime, func, DECIMAL, ForeignKey, Text
from ..db import Base

class GoalModel(Base):
    __tablename__ = "goals"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    target_amount = Column(DECIMAL(10,2), nullable=False)
    current_amount = Column(DECIMAL(10,2), default=0)
    deadline = Column(Date, nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now()) 
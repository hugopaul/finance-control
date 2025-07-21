import uuid
from sqlalchemy import Column, String, Text, DateTime, func, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from ..db import Base

class PeopleModel(Base):
    __tablename__ = "people"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(255))
    phone = Column(String(20))
    relationship = Column(String(50), ForeignKey("relationships.id"), nullable=False)
    color = Column(String(20), default="bg-blue-500")
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now()) 
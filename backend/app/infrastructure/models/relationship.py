from sqlalchemy import Column, String, DateTime, func
from ..db import Base

class RelationshipModel(Base):
    __tablename__ = "relationships"
    
    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    icon = Column(String(10))
    created_at = Column(DateTime(timezone=True), default=func.now()) 
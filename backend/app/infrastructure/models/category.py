from sqlalchemy import Column, String, TIMESTAMP, text
from ..db import Base

class CategoryModel(Base):
    __tablename__ = "categories"
    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    icon = Column(String(10))
    color = Column(String(7))
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("CURRENT_TIMESTAMP")) 
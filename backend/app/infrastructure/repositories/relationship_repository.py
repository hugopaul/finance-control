from sqlalchemy.orm import Session
from ..models.relationship import RelationshipModel
from ...domain.dto.relationship import RelationshipDTO

class RelationshipRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def get_all(self) -> list[RelationshipDTO]:
        """Busca todos os relacionamentos"""
        relationships = self.db.query(RelationshipModel).all()
        return [RelationshipDTO.model_validate(rel) for rel in relationships]
    
    def get_by_id(self, relationship_id: str) -> RelationshipDTO | None:
        """Busca um relacionamento por ID"""
        relationship = self.db.query(RelationshipModel).filter(
            RelationshipModel.id == relationship_id
        ).first()
        
        if not relationship:
            return None
            
        return RelationshipDTO.model_validate(relationship) 
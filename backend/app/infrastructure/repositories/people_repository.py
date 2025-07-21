import uuid
from sqlalchemy.orm import Session
from sqlalchemy import extract
from ..models.people import PeopleModel
from ...domain.dto.people import PeopleDTO, PeopleCreateDTO, PeopleUpdateDTO

class PeopleRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def get_all_by_user(self, user_id: uuid.UUID) -> list[PeopleDTO]:
        """Busca todas as pessoas de um usuário"""
        people = self.db.query(PeopleModel).filter(
            PeopleModel.user_id == user_id
        ).all()
        return [PeopleDTO.model_validate(person) for person in people]
    
    def get_by_id(self, person_id: uuid.UUID, user_id: uuid.UUID) -> PeopleDTO | None:
        """Busca uma pessoa por ID e usuário"""
        person = self.db.query(PeopleModel).filter(
            PeopleModel.id == person_id,
            PeopleModel.user_id == user_id
        ).first()
        
        if not person:
            return None
            
        return PeopleDTO.model_validate(person)
    
    def create(self, user_id: uuid.UUID, person_data: PeopleCreateDTO) -> PeopleDTO:
        """Cria uma nova pessoa"""
        person = PeopleModel(
            user_id=user_id,
            name=person_data.name,
            email=person_data.email,
            phone=person_data.phone,
            relationship=person_data.relationship,
            color=person_data.color,
            notes=person_data.notes
        )
        
        self.db.add(person)
        self.db.commit()
        self.db.refresh(person)
        
        return PeopleDTO.model_validate(person)
    
    def update(self, person_id: uuid.UUID, user_id: uuid.UUID, person_data: PeopleUpdateDTO) -> PeopleDTO | None:
        """Atualiza uma pessoa"""
        person = self.db.query(PeopleModel).filter(
            PeopleModel.id == person_id,
            PeopleModel.user_id == user_id
        ).first()
        
        if not person:
            return None
        
        # Atualiza apenas os campos fornecidos
        update_data = person_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(person, field, value)
        
        self.db.commit()
        self.db.refresh(person)
        
        return PeopleDTO.model_validate(person)
    
    def delete(self, person_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        """Deleta uma pessoa"""
        person = self.db.query(PeopleModel).filter(
            PeopleModel.id == person_id,
            PeopleModel.user_id == user_id
        ).first()
        
        if not person:
            return False
        
        self.db.delete(person)
        self.db.commit()
        
        return True 
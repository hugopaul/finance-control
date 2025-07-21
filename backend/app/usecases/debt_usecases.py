import uuid
from datetime import date
from typing import Optional
from ..infrastructure.repositories.people_repository import PeopleRepository
from ..infrastructure.repositories.debt_repository import DebtRepository
from ..infrastructure.repositories.relationship_repository import RelationshipRepository
from ..domain.dto.people import PeopleCreateDTO, PeopleUpdateDTO
from ..domain.dto.debt import DebtCreateDTO, DebtUpdateDTO, DebtPaymentDTO

class DebtUseCases:
    def __init__(self, people_repo: PeopleRepository, debt_repo: DebtRepository, relationship_repo: RelationshipRepository):
        self.people_repo = people_repo
        self.debt_repo = debt_repo
        self.relationship_repo = relationship_repo
    
    # Casos de uso para Pessoas
    def get_all_people(self, user_id: uuid.UUID):
        """Busca todas as pessoas de um usuário"""
        return self.people_repo.get_all_by_user(user_id)
    
    def get_person_by_id(self, person_id: uuid.UUID, user_id: uuid.UUID):
        """Busca uma pessoa por ID"""
        return self.people_repo.get_by_id(person_id, user_id)
    
    def create_person(self, user_id: uuid.UUID, person_data: PeopleCreateDTO):
        """Cria uma nova pessoa"""
        # Valida se o relacionamento existe
        relationship = self.relationship_repo.get_by_id(person_data.relationship)
        if not relationship:
            raise ValueError("Relacionamento não encontrado")
        
        return self.people_repo.create(user_id, person_data)
    
    def update_person(self, person_id: uuid.UUID, user_id: uuid.UUID, person_data: PeopleUpdateDTO):
        """Atualiza uma pessoa"""
        # Valida se o relacionamento existe (se fornecido)
        if person_data.relationship:
            relationship = self.relationship_repo.get_by_id(person_data.relationship)
            if not relationship:
                raise ValueError("Relacionamento não encontrado")
        
        return self.people_repo.update(person_id, user_id, person_data)
    
    def delete_person(self, person_id: uuid.UUID, user_id: uuid.UUID):
        """Deleta uma pessoa"""
        return self.people_repo.delete(person_id, user_id)
    
    # Casos de uso para Dívidas
    def get_all_debts(self, user_id: uuid.UUID, month: Optional[date] = None, person_id: Optional[uuid.UUID] = None, status: Optional[str] = None):
        """Busca todas as dívidas de um usuário com filtros opcionais"""
        return self.debt_repo.get_all_by_user(user_id, month, person_id, status)
    
    def get_debt_by_id(self, debt_id: uuid.UUID, user_id: uuid.UUID):
        """Busca uma dívida por ID"""
        return self.debt_repo.get_by_id(debt_id, user_id)
    
    def create_debt(self, user_id: uuid.UUID, debt_data: DebtCreateDTO):
        """Cria uma nova dívida"""
        # Valida se a pessoa existe e pertence ao usuário
        person = self.people_repo.get_by_id(uuid.UUID(debt_data.person_id), user_id)
        if not person:
            raise ValueError("Pessoa não encontrada")
        
        # Validações de negócio
        if debt_data.amount <= 0:
            raise ValueError("O valor da dívida deve ser maior que zero")
        
        if debt_data.due_date and debt_data.due_date < debt_data.date:
            raise ValueError("A data de vencimento não pode ser anterior à data da dívida")
        
        return self.debt_repo.create(user_id, debt_data)
    
    def update_debt(self, debt_id: uuid.UUID, user_id: uuid.UUID, debt_data: DebtUpdateDTO):
        """Atualiza uma dívida"""
        # Valida se a pessoa existe e pertence ao usuário (se fornecida)
        if debt_data.person_id:
            person = self.people_repo.get_by_id(uuid.UUID(debt_data.person_id), user_id)
            if not person:
                raise ValueError("Pessoa não encontrada")
        
        # Validações de negócio
        if debt_data.amount is not None and debt_data.amount <= 0:
            raise ValueError("O valor da dívida deve ser maior que zero")
        
        if debt_data.due_date and debt_data.date and debt_data.due_date < debt_data.date:
            raise ValueError("A data de vencimento não pode ser anterior à data da dívida")
        
        return self.debt_repo.update(debt_id, user_id, debt_data)
    
    def update_debt_payment(self, debt_id: uuid.UUID, user_id: uuid.UUID, payment_data: DebtPaymentDTO):
        """Atualiza o pagamento de uma dívida"""
        # Validações de negócio
        if payment_data.paid_amount < 0:
            raise ValueError("O valor pago não pode ser negativo")
        
        return self.debt_repo.update_payment(debt_id, user_id, payment_data)
    
    def delete_debt(self, debt_id: uuid.UUID, user_id: uuid.UUID):
        """Deleta uma dívida"""
        return self.debt_repo.delete(debt_id, user_id) 
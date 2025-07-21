import uuid
from datetime import date
from decimal import Decimal
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import extract
from dateutil.relativedelta import relativedelta
from ..models.debt import DebtsModel
from ...domain.dto.debt import DebtDTO, DebtCreateDTO, DebtUpdateDTO, DebtPaymentDTO

class DebtRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def get_all_by_user(self, user_id: uuid.UUID, month: date = None, person_id: uuid.UUID = None, status: str = None) -> list[DebtDTO]:
        """Busca todas as dívidas de um usuário com filtros opcionais"""
        query = self.db.query(DebtsModel).options(
            joinedload(DebtsModel.person)
        ).filter(DebtsModel.user_id == user_id)
        
        # Filtro por mês
        if month:
            query = query.filter(
                extract('year', DebtsModel.date) == month.year,
                extract('month', DebtsModel.date) == month.month
            )
        
        # Filtro por pessoa
        if person_id:
            query = query.filter(DebtsModel.person_id == person_id)
        
        # Filtro por status
        if status:
            query = query.filter(DebtsModel.status == status)
        
        debts = query.all()
        return [DebtDTO.model_validate(debt) for debt in debts]
    
    def get_by_id(self, debt_id: uuid.UUID, user_id: uuid.UUID) -> DebtDTO | None:
        """Busca uma dívida por ID e usuário"""
        debt = self.db.query(DebtsModel).options(
            joinedload(DebtsModel.person)
        ).filter(
            DebtsModel.id == debt_id,
            DebtsModel.user_id == user_id
        ).first()
        
        if not debt:
            return None
            
        return DebtDTO.model_validate(debt)
    
    def create(self, user_id: uuid.UUID, debt_data: DebtCreateDTO) -> DebtDTO:
        """Cria uma nova dívida"""
        # Se for parcelada, criar múltiplas dívidas
        if debt_data.total_installments and debt_data.total_installments > 1:
            parcela_valor = round(debt_data.amount / debt_data.total_installments, 2)
            debts = []
            for i in range(debt_data.total_installments):
                debt_date = debt_data.date + relativedelta(months=i)
                due_date = debt_data.due_date + relativedelta(months=i) if debt_data.due_date else debt_date
                debt = DebtsModel(
                    user_id=user_id,
                    person_id=uuid.UUID(debt_data.person_id),
                    description=debt_data.description,
                    amount=parcela_valor,
                    date=debt_date,
                    due_date=due_date,
                    installments=i+1,
                    total_installments=debt_data.total_installments,
                    payment_method_id=debt_data.payment_method_id
                )
                self.db.add(debt)
                self.db.flush()  # Garante geração de ID
                debts.append(debt)
            self.db.commit()
            self.db.refresh(debts[0])
            
            # Recarrega com a pessoa
            debt = self.db.query(DebtsModel).options(
                joinedload(DebtsModel.person)
            ).filter(DebtsModel.id == debts[0].id).first()
            
            return DebtDTO.model_validate(debt)
        else:
            # Dívida única
            debt = DebtsModel(
                user_id=user_id,
                person_id=uuid.UUID(debt_data.person_id),
                description=debt_data.description,
                amount=Decimal(str(debt_data.amount)),
                date=debt_data.date,
                due_date=debt_data.due_date,
                installments=debt_data.installments,
                total_installments=debt_data.total_installments,
                payment_method_id=debt_data.payment_method_id
            )
            
            self.db.add(debt)
            self.db.commit()
            self.db.refresh(debt)
            
            # Recarrega com a pessoa
            debt = self.db.query(DebtsModel).options(
                joinedload(DebtsModel.person)
            ).filter(DebtsModel.id == debt.id).first()
            
            return DebtDTO.model_validate(debt)
    
    def update(self, debt_id: uuid.UUID, user_id: uuid.UUID, debt_data: DebtUpdateDTO) -> DebtDTO | None:
        """Atualiza uma dívida"""
        debt = self.db.query(DebtsModel).filter(
            DebtsModel.id == debt_id,
            DebtsModel.user_id == user_id
        ).first()
        
        if not debt:
            return None
        
        # Atualiza apenas os campos fornecidos e existentes no modelo
        update_data = debt_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if not hasattr(debt, field):
                continue  # Ignora campos extras
            if field == 'amount' and value is not None:
                setattr(debt, field, Decimal(str(value)))
            elif field == 'person_id' and value is not None:
                setattr(debt, field, uuid.UUID(value))
            elif field in ['installments', 'total_installments'] and value is not None:
                setattr(debt, field, value)
            else:
                setattr(debt, field, value)
        
        self.db.commit()
        self.db.refresh(debt)
        
        # Recarrega com a pessoa
        debt = self.db.query(DebtsModel).options(
            joinedload(DebtsModel.person)
        ).filter(DebtsModel.id == debt.id).first()
        
        return DebtDTO.model_validate(debt)
    
    def update_payment(self, debt_id: uuid.UUID, user_id: uuid.UUID, payment_data: DebtPaymentDTO) -> DebtDTO | None:
        """Atualiza o pagamento de uma dívida"""
        debt = self.db.query(DebtsModel).filter(
            DebtsModel.id == debt_id,
            DebtsModel.user_id == user_id
        ).first()
        
        if not debt:
            return None
        
        # Atualiza o valor pago
        debt.paid_amount = Decimal(str(payment_data.paid_amount))
        
        # Atualiza o status baseado no valor pago
        if debt.paid_amount >= debt.amount:
            debt.status = "paid"
        elif debt.paid_amount > 0:
            debt.status = "partial"
        else:
            debt.status = "pending"
        
        self.db.commit()
        self.db.refresh(debt)
        
        # Recarrega com a pessoa
        debt = self.db.query(DebtsModel).options(
            joinedload(DebtsModel.person)
        ).filter(DebtsModel.id == debt.id).first()
        
        return DebtDTO.model_validate(debt)
    
    def delete(self, debt_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        """Deleta uma dívida"""
        debt = self.db.query(DebtsModel).filter(
            DebtsModel.id == debt_id,
            DebtsModel.user_id == user_id
        ).first()
        
        if not debt:
            return False
        
        self.db.delete(debt)
        self.db.commit()
        
        return True 
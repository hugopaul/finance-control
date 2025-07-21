from sqlalchemy.orm import Session
from sqlalchemy import and_, extract
from typing import List, Optional, Tuple
from datetime import date, timedelta
from dateutil.relativedelta import relativedelta
from ..models.transaction import TransactionModel
from ...domain.dto.transaction import TransactionDTO, TransactionCreateDTO, TransactionUpdateDTO

class TransactionRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(self, user_id: str, month: Optional[str] = None, type_: Optional[str] = None, category: Optional[str] = None) -> Tuple[List[TransactionDTO], int]:
        query = self.db.query(TransactionModel).filter(TransactionModel.user_id == user_id)
        
        if month:
            try:
                year, month_num = month.split("-")
                query = query.filter(
                    extract('year', TransactionModel.date) == int(year),
                    extract('month', TransactionModel.date) == int(month_num)
                )
            except ValueError:
                pass
                
        if type_:
            query = query.filter(TransactionModel.type == type_)
        if category:
            query = query.filter(TransactionModel.category == category)
            
        total = query.count()
        transactions = query.order_by(TransactionModel.date.desc()).all()
        return [TransactionDTO.model_validate(t) for t in transactions], total

    def get(self, user_id: str, transaction_id: str) -> TransactionDTO | None:
        transaction = self.db.query(TransactionModel).filter(
            and_(TransactionModel.user_id == user_id, TransactionModel.id == transaction_id)
        ).first()
        
        if not transaction:
            return None
            
        return TransactionDTO.model_validate(transaction)

    def create(self, user_id: str, data) -> TransactionDTO:
        # Permitir tanto DTO quanto dict
        def get_field(obj, field):
            if hasattr(obj, field):
                return getattr(obj, field)
            if isinstance(obj, dict):
                return obj.get(field)
            return None

        transactions = []
        # Parcelada
        if get_field(data, 'total_installments') and get_field(data, 'total_installments') > 1:
            parcela_valor = round(get_field(data, 'amount') / get_field(data, 'total_installments'), 2)
            for i in range(get_field(data, 'total_installments')):
                trans_date = get_field(data, 'date') + relativedelta(months=i)
                due_date = get_field(data, 'due_date') + relativedelta(months=i) if get_field(data, 'due_date') else trans_date
                transaction = TransactionModel(
                    user_id=user_id,
                    description=get_field(data, 'description'),
                    amount=parcela_valor,
                    type=get_field(data, 'type'),
                    category=get_field(data, 'category'),
                    date=trans_date,
                    is_recurring=False,
                    installments=i+1,
                    total_installments=get_field(data, 'total_installments'),
                    due_date=due_date,
                    payment_method_id=get_field(data, 'payment_method_id')
                )
                self.db.add(transaction)
                self.db.flush()
                transactions.append(transaction)
            self.db.commit()
            self.db.refresh(transactions[0])
            return TransactionDTO.model_validate(transactions[0])
        # Recorrente
        elif get_field(data, 'is_recurring'):
            for i in range(6):
                trans_date = get_field(data, 'date') + relativedelta(months=i)
                transaction = TransactionModel(
                    user_id=user_id,
                    description=get_field(data, 'description'),
                    amount=get_field(data, 'amount'),
                    type=get_field(data, 'type'),
                    category=get_field(data, 'category'),
                    date=trans_date,
                    is_recurring=True,
                    installments=None,
                    total_installments=None,
                    due_date=None,
                    payment_method_id=get_field(data, 'payment_method_id')
                )
                self.db.add(transaction)
                self.db.flush()
                transactions.append(transaction)
            self.db.commit()
            self.db.refresh(transactions[0])
            return TransactionDTO.model_validate(transactions[0])
        # Normal
        else:
            transaction = TransactionModel(
                user_id=user_id,
                description=get_field(data, 'description'),
                amount=get_field(data, 'amount'),
                type=get_field(data, 'type'),
                category=get_field(data, 'category'),
                date=get_field(data, 'date'),
                is_recurring=False,
                installments=None,
                total_installments=None,
                due_date=get_field(data, 'due_date'),
                payment_method_id=get_field(data, 'payment_method_id')
            )
            self.db.add(transaction)
            self.db.commit()
            self.db.refresh(transaction)
            return TransactionDTO.model_validate(transaction)

    def update(self, user_id: str, transaction_id: str, data) -> TransactionDTO | None:
        transaction = self.get(user_id, transaction_id)
        if not transaction:
            return None
        transaction_model = self.db.query(TransactionModel).filter(
            and_(TransactionModel.user_id == user_id, TransactionModel.id == transaction_id)
        ).first()
        # Aceitar tanto DTO quanto dict
        if hasattr(data, 'model_dump'):
            update_data = data.model_dump(exclude_unset=True)
        else:
            update_data = {k: v for k, v in data.items() if v is not None}
        for key, value in update_data.items():
            setattr(transaction_model, key, value)
        self.db.commit()
        self.db.refresh(transaction_model)
        return TransactionDTO.model_validate(transaction_model)

    def delete(self, user_id: str, transaction_id: str) -> bool:
        transaction = self.db.query(TransactionModel).filter(
            and_(TransactionModel.user_id == user_id, TransactionModel.id == transaction_id)
        ).first()
        
        if not transaction:
            return False
            
        self.db.delete(transaction)
        self.db.commit()
        return True 
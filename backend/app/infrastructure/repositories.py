from sqlalchemy.orm import Session
from .models import UserModel, TransactionModel, CategoryModel
from sqlalchemy.exc import IntegrityError
from sqlalchemy import and_, or_
from typing import List, Optional

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_email(self, email: str):
        return self.db.query(UserModel).filter(UserModel.email == email).first()

    def get_by_id(self, user_id: str):
        return self.db.query(UserModel).filter(UserModel.id == user_id).first()

    def create(self, name: str, email: str, password: str, avatar: str = None):
        user = UserModel(name=name, email=email, password_hash=password, avatar=avatar)
        self.db.add(user)
        try:
            self.db.commit()
            self.db.refresh(user)
            return user
        except IntegrityError:
            self.db.rollback()
            return None 

class TransactionRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(self, user_id: str, month: Optional[str] = None, type_: Optional[str] = None, category: Optional[str] = None, page: int = 1, limit: int = 20):
        query = self.db.query(TransactionModel).filter(TransactionModel.user_id == user_id)
        if month:
            query = query.filter(TransactionModel.date.like(f"{month}%"))
        if type_:
            query = query.filter(TransactionModel.type == type_)
        if category:
            query = query.filter(TransactionModel.category == category)
        total = query.count()
        transactions = query.order_by(TransactionModel.date.desc()).offset((page-1)*limit).limit(limit).all()
        return transactions, total

    def get(self, user_id: str, transaction_id: str):
        return self.db.query(TransactionModel).filter(and_(TransactionModel.user_id == user_id, TransactionModel.id == transaction_id)).first()

    def create(self, user_id: str, data: dict):
        # Remove id do data para evitar conflito
        data_copy = data.copy()
        data_copy.pop('id', None)
        
        transaction = TransactionModel(user_id=user_id, **data_copy)
        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)
        return transaction

    def update(self, user_id: str, transaction_id: str, data: dict):
        transaction = self.get(user_id, transaction_id)
        if not transaction:
            return None
        for key, value in data.items():
            setattr(transaction, key, value)
        self.db.commit()
        self.db.refresh(transaction)
        return transaction

    def delete(self, user_id: str, transaction_id: str):
        transaction = self.get(user_id, transaction_id)
        if not transaction:
            return False
        self.db.delete(transaction)
        self.db.commit()
        return True 
from sqlalchemy.orm import Session
from app.infrastructure.models.payment_method import PaymentMethodModel
from uuid import UUID

class PaymentMethodRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(PaymentMethodModel).all()

    def get_by_id(self, payment_method_id: UUID):
        return self.db.query(PaymentMethodModel).filter(PaymentMethodModel.id == payment_method_id).first()

    def get_by_name(self, name: str):
        return self.db.query(PaymentMethodModel).filter(PaymentMethodModel.name == name).first()

    def create(self, name: str, description: str = None):
        payment_method = PaymentMethodModel(name=name, description=description)
        self.db.add(payment_method)
        self.db.commit()
        self.db.refresh(payment_method)
        return payment_method

    def update(self, payment_method_id: UUID, name: str = None, description: str = None):
        payment_method = self.get_by_id(payment_method_id)
        if not payment_method:
            return None
        if name:
            payment_method.name = name
        if description is not None:
            payment_method.description = description
        self.db.commit()
        self.db.refresh(payment_method)
        return payment_method

    def delete(self, payment_method_id: UUID):
        payment_method = self.get_by_id(payment_method_id)
        if not payment_method:
            return False
        self.db.delete(payment_method)
        self.db.commit()
        return True 
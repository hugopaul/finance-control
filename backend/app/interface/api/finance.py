from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.interface.api.dependencies import get_current_user
from app.infrastructure.db import SessionLocal
from app.infrastructure.repositories import TransactionRepository
from app.infrastructure.models import CategoryModel, TransactionModel
from app.domain.dto.transaction import TransactionCreateDTO, TransactionUpdateDTO, TransactionDTO
from app.interface.api.utils import success_response, error_response
from typing import List, Optional
from uuid import uuid4
from datetime import date as date_cls
from sqlalchemy import func, and_, or_, extract
from app.usecases.goal_usecases import GoalUseCases
from app.domain.dto.goal import GoalCreateDTO, GoalUpdateDTO
from app.interface.api.dependencies import get_db
from app.infrastructure.repositories.payment_method_repository import PaymentMethodRepository
from app.domain.dto.payment_method import PaymentMethodDTO, PaymentMethodCreateDTO, PaymentMethodUpdateDTO

router = APIRouter(prefix="/finance/transactions", tags=["Finanças"])

@router.get("/", response_model=List[TransactionDTO])
def list_transactions(
    month: Optional[str] = Query(None, description="YYYY-MM"),
    type: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    authorization: str = Depends(get_current_user)
):
    db = SessionLocal()
    try:
        repo = TransactionRepository(db)
        transactions, total = repo.list(authorization, month, type, category)
        data = [TransactionDTO.model_validate(t, from_attributes=True).model_dump(mode="json") for t in transactions]
        return success_response(data=data, message="Transações listadas com sucesso")
    finally:
        db.close()

@router.post("/", response_model=TransactionDTO, status_code=201)
def create_transaction(
    data: TransactionCreateDTO,
    user_id: str = Depends(get_current_user)
):
    db = SessionLocal()
    try:
        if data.amount <= 0:
            return error_response(message="O valor da transação deve ser positivo.", status_code=status.HTTP_400_BAD_REQUEST)
        if data.type not in ("income", "expense"):
            return error_response(message="Tipo de transação inválido.", status_code=status.HTTP_400_BAD_REQUEST)
        category = db.query(CategoryModel).filter(CategoryModel.id == data.category).first()
        if not category:
            return error_response(message="Categoria não encontrada.", status_code=status.HTTP_400_BAD_REQUEST)
        if data.total_installments is not None:
            if data.total_installments < 1:
                return error_response(message="O número total de parcelas deve ser maior ou igual a 1.", status_code=status.HTTP_400_BAD_REQUEST)
            if data.installments is not None and data.installments > data.total_installments:
                return error_response(message="A parcela atual não pode ser maior que o total de parcelas.", status_code=status.HTTP_400_BAD_REQUEST)
            if data.due_date and data.due_date < data.date:
                return error_response(message="A data de vencimento não pode ser anterior à data da transação.", status_code=status.HTTP_400_BAD_REQUEST)
        if data.date > date_cls.today():
            return error_response(message="A data da transação não pode ser no futuro.", status_code=status.HTTP_400_BAD_REQUEST)
        repo = TransactionRepository(db)
        # Corrigido: passar o objeto data diretamente, sem converter para dict
        transaction = repo.create(user_id, data)
        return success_response(data=TransactionDTO.model_validate(transaction, from_attributes=True).model_dump(mode="json"), message="Transação criada com sucesso")
    finally:
        db.close()

@router.put("/{transaction_id}", response_model=TransactionDTO)
def update_transaction(
    transaction_id: str,
    data: TransactionUpdateDTO,
    user_id: str = Depends(get_current_user)
):
    db = SessionLocal()
    try:
        update_data = {k: v for k, v in data.dict().items() if v is not None}
        if 'amount' in update_data and update_data['amount'] <= 0:
            return error_response(message="O valor da transação deve ser positivo.", status_code=status.HTTP_400_BAD_REQUEST)
        if 'type' in update_data and update_data['type'] not in ("income", "expense"):
            return error_response(message="Tipo de transação inválido.", status_code=status.HTTP_400_BAD_REQUEST)
        if 'category' in update_data:
            category = db.query(CategoryModel).filter(CategoryModel.id == update_data['category']).first()
            if not category:
                return error_response(message="Categoria não encontrada.", status_code=status.HTTP_400_BAD_REQUEST)
        if 'total_installments' in update_data:
            if update_data['total_installments'] < 1:
                return error_response(message="O número total de parcelas deve ser maior ou igual a 1.", status_code=status.HTTP_400_BAD_REQUEST)
            if 'installments' in update_data and update_data['installments'] > update_data['total_installments']:
                return error_response(message="A parcela atual não pode ser maior que o total de parcelas.", status_code=status.HTTP_400_BAD_REQUEST)
            if 'due_date' in update_data and 'date' in update_data and update_data['due_date'] < update_data['date']:
                return error_response(message="A data de vencimento não pode ser anterior à data da transação.", status_code=status.HTTP_400_BAD_REQUEST)
        if 'date' in update_data and update_data['date'] > date_cls.today():
            return error_response(message="A data da transação não pode ser no futuro.", status_code=status.HTTP_400_BAD_REQUEST)
        repo = TransactionRepository(db)
        transaction = repo.update(user_id, transaction_id, update_data)
        if not transaction:
            return error_response(message="Transação não encontrada", status_code=status.HTTP_404_NOT_FOUND)
        return success_response(data=TransactionDTO.model_validate(transaction, from_attributes=True).model_dump(mode="json"), message="Transação atualizada com sucesso")
    finally:
        db.close()

@router.delete("/{transaction_id}")
def delete_transaction(
    transaction_id: str,
    user_id: str = Depends(get_current_user)
):
    db = SessionLocal()
    try:
        repo = TransactionRepository(db)
        success = repo.delete(user_id, transaction_id)
        if not success:
            return error_response(message="Transação não encontrada", status_code=status.HTTP_404_NOT_FOUND)
        return success_response(message="Transação deletada com sucesso")
    finally:
        db.close()

@router.get("/summary")
def get_finance_summary(
    month: str = Query(..., description="YYYY-MM"),
    user_id: str = Depends(get_current_user)
):
    db = SessionLocal()
    try:
        repo = TransactionRepository(db)
        year, month_num = map(int, month.split('-'))
        total_income = db.query(func.coalesce(func.sum(TransactionModel.amount), 0)).filter(
            TransactionModel.user_id == user_id,
            TransactionModel.type == "income",
            extract('year', TransactionModel.date) == year,
            extract('month', TransactionModel.date) == month_num
        ).scalar()
        total_expenses = db.query(func.coalesce(func.sum(TransactionModel.amount), 0)).filter(
            TransactionModel.user_id == user_id,
            TransactionModel.type == "expense",
            extract('year', TransactionModel.date) == year,
            extract('month', TransactionModel.date) == month_num
        ).scalar()
        balance = total_income - total_expenses
        expenses_by_category = dict(
            db.query(TransactionModel.category, func.coalesce(func.sum(TransactionModel.amount), 0))
            .filter(TransactionModel.user_id == user_id, TransactionModel.type == "expense",
                    extract('year', TransactionModel.date) == year,
                    extract('month', TransactionModel.date) == month_num)
            .group_by(TransactionModel.category)
            .all()
        )
        today = date_cls.today()
        pending_installments = db.query(func.coalesce(func.sum(TransactionModel.amount), 0)).filter(
            TransactionModel.user_id == user_id,
            TransactionModel.due_date != None,
            TransactionModel.due_date >= today,
            TransactionModel.type == "expense"
        ).scalar()
        recurring_expenses = db.query(func.coalesce(func.sum(TransactionModel.amount), 0)).filter(
            TransactionModel.user_id == user_id,
            TransactionModel.is_recurring == True,
            TransactionModel.type == "expense",
            extract('year', TransactionModel.date) == year,
            extract('month', TransactionModel.date) == month_num
        ).scalar()
        projected_balance = balance - (pending_installments or 0)
        installments = db.query(TransactionModel).filter(
            TransactionModel.user_id == user_id,
            TransactionModel.total_installments != None,
            extract('year', TransactionModel.date) == year,
            extract('month', TransactionModel.date) == month_num
        ).all()
        installments_out = [
            {
                "id": str(t.id),
                "description": t.description,
                "amount": float(t.amount),
                "totalAmount": float(t.amount) * (t.total_installments or 1),
                "currentInstallment": t.installments,
                "totalInstallments": t.total_installments,
                "dueDate": t.due_date.isoformat() if t.due_date else None,
                "status": "pending" if t.due_date and t.due_date >= today else "paid"
            }
            for t in installments
        ]
        return success_response(data={
            "summary": {
                "totalIncome": float(total_income or 0),
                "totalExpenses": float(total_expenses or 0),
                "balance": float(balance or 0),
                "projectedBalance": float(projected_balance or 0),
                "pendingInstallments": float(pending_installments or 0),
                "recurringExpenses": float(recurring_expenses or 0)
            },
            "expensesByCategory": {k: float(v) for k, v in expenses_by_category.items()},
            "installments": installments_out
        })
    finally:
        db.close()

# Endpoints de GOALS
from fastapi import APIRouter, Depends, status

goals_router = APIRouter(prefix="/finance/goals", tags=["Metas Financeiras"])

@goals_router.get("/", response_model=None)
def list_goals(user_id: str = Depends(get_current_user), db=Depends(get_db)):
    usecases = GoalUseCases(db)
    goals = usecases.list_goals(user_id)
    return success_response(data={"goals": [g.model_dump(mode='json') for g in goals]})

@goals_router.post("/", response_model=None, status_code=201)
def create_goal(data: GoalCreateDTO, user_id: str = Depends(get_current_user), db=Depends(get_db)):
    usecases = GoalUseCases(db)
    goal = usecases.create_goal(user_id, data)
    return success_response(data={"goal": goal.model_dump(mode='json')}, message="Meta criada com sucesso")

@goals_router.get("/{goal_id}", response_model=None)
def get_goal(goal_id: str, user_id: str = Depends(get_current_user), db=Depends(get_db)):
    usecases = GoalUseCases(db)
    goal = usecases.get_goal(user_id, goal_id)
    if not goal:
        return error_response(message="Meta não encontrada", status_code=status.HTTP_404_NOT_FOUND)
    return success_response(data={"goal": goal.model_dump(mode='json')})

@goals_router.put("/{goal_id}", response_model=None)
def update_goal(goal_id: str, data: GoalUpdateDTO, user_id: str = Depends(get_current_user), db=Depends(get_db)):
    usecases = GoalUseCases(db)
    goal = usecases.update_goal(user_id, goal_id, data)
    if not goal:
        return error_response(message="Meta não encontrada", status_code=status.HTTP_404_NOT_FOUND)
    return success_response(data={"goal": goal.model_dump(mode='json')}, message="Meta atualizada com sucesso")

@goals_router.delete("/{goal_id}")
def delete_goal(goal_id: str, user_id: str = Depends(get_current_user), db=Depends(get_db)):
    usecases = GoalUseCases(db)
    success = usecases.delete_goal(user_id, goal_id)
    if not success:
        return error_response(message="Meta não encontrada", status_code=status.HTTP_404_NOT_FOUND)
    return success_response(message="Meta deletada com sucesso")

# Endpoints de formas de pagamento
payment_router = APIRouter(prefix="/finance/payment-methods", tags=["Formas de Pagamento"])

@payment_router.get("/", response_model=List[PaymentMethodDTO])
def list_payment_methods(user_id: str = Depends(get_current_user)):
    db = SessionLocal()
    try:
        repo = PaymentMethodRepository(db)
        payment_methods = repo.get_all()
        data = [PaymentMethodDTO.model_validate(pm, from_attributes=True).model_dump(mode="json") for pm in payment_methods]
        return success_response(data=data, message="Formas de pagamento listadas com sucesso")
    finally:
        db.close()

@payment_router.post("/", response_model=PaymentMethodDTO, status_code=201)
def create_payment_method(data: PaymentMethodCreateDTO, user_id: str = Depends(get_current_user)):
    db = SessionLocal()
    try:
        repo = PaymentMethodRepository(db)
        if repo.get_by_name(data.name):
            return error_response(message="Já existe uma forma de pagamento com esse nome.", status_code=status.HTTP_400_BAD_REQUEST)
        payment_method = repo.create(name=data.name, description=data.description)
        return success_response(data=PaymentMethodDTO.model_validate(payment_method, from_attributes=True).model_dump(mode="json"), message="Forma de pagamento criada com sucesso")
    finally:
        db.close()

@payment_router.put("/{payment_method_id}", response_model=PaymentMethodDTO)
def update_payment_method(payment_method_id: str, data: PaymentMethodUpdateDTO, user_id: str = Depends(get_current_user)):
    db = SessionLocal()
    try:
        repo = PaymentMethodRepository(db)
        payment_method = repo.update(payment_method_id, name=data.name, description=data.description)
        if not payment_method:
            return error_response(message="Forma de pagamento não encontrada", status_code=status.HTTP_404_NOT_FOUND)
        return success_response(data=PaymentMethodDTO.model_validate(payment_method, from_attributes=True).model_dump(mode="json"), message="Forma de pagamento atualizada com sucesso")
    finally:
        db.close()

@payment_router.delete("/{payment_method_id}")
def delete_payment_method(payment_method_id: str, user_id: str = Depends(get_current_user)):
    db = SessionLocal()
    try:
        repo = PaymentMethodRepository(db)
        success = repo.delete(payment_method_id)
        if not success:
            return error_response(message="Forma de pagamento não encontrada", status_code=status.HTTP_404_NOT_FOUND)
        return success_response(message="Forma de pagamento deletada com sucesso")
    finally:
        db.close()

# Exportar apenas os routers principais
__all__ = ["router", "goals_router"] 
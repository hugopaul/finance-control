import uuid
from datetime import date
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ...infrastructure.db import get_db
from ...infrastructure.repositories.people_repository import PeopleRepository
from ...infrastructure.repositories.debt_repository import DebtRepository
from ...infrastructure.repositories.relationship_repository import RelationshipRepository
from ...usecases.debt_usecases import DebtUseCases
from ...domain.dto.people import PeopleCreateDTO, PeopleUpdateDTO
from ...domain.dto.debt import DebtCreateDTO, DebtUpdateDTO, DebtPaymentDTO, DebtDTO
from ...interface.api.dependencies import get_current_user_data
from ...domain.dto.user import UserDTO
from .utils import error_response, success_response

router = APIRouter(prefix="/debts", tags=["Dívidas"])

def get_debt_usecases(db: Session = Depends(get_db)) -> DebtUseCases:
    people_repo = PeopleRepository(db)
    debt_repo = DebtRepository(db)
    relationship_repo = RelationshipRepository(db)
    return DebtUseCases(people_repo, debt_repo, relationship_repo)

# Endpoints para Pessoas

@router.get("/people")
def list_people(
    current_user: UserDTO = Depends(get_current_user_data),
    usecases: DebtUseCases = Depends(get_debt_usecases)
):
    try:
        people = usecases.get_all_people(current_user.id)
        return success_response(data={"people": [person.model_dump(mode='json') for person in people]})
    except Exception as e:
        return error_response(message="Erro interno do servidor", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

@router.post("/people")
def create_person(
    person_data: PeopleCreateDTO,
    current_user: UserDTO = Depends(get_current_user_data),
    usecases: DebtUseCases = Depends(get_debt_usecases)
):
    try:
        person = usecases.create_person(current_user.id, person_data)
        return success_response(message="Pessoa criada com sucesso", data={"person": person.model_dump(mode='json')})
    except ValueError as e:
        return error_response(message=str(e), status_code=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return error_response(message="Erro interno do servidor", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

@router.get("/people/{person_id}")
def get_person(
    person_id: str,
    current_user: UserDTO = Depends(get_current_user_data),
    usecases: DebtUseCases = Depends(get_debt_usecases)
):
    try:
        person = usecases.get_person_by_id(uuid.UUID(person_id), current_user.id)
        if not person:
            return error_response(message="Pessoa não encontrada", status_code=status.HTTP_404_NOT_FOUND)
        return success_response(data={"person": person.model_dump(mode='json')})
    except Exception as e:
        return error_response(message="Erro interno do servidor", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

@router.put("/people/{person_id}")
def update_person(
    person_id: str,
    person_data: PeopleUpdateDTO,
    current_user: UserDTO = Depends(get_current_user_data),
    usecases: DebtUseCases = Depends(get_debt_usecases)
):
    try:
        person = usecases.update_person(uuid.UUID(person_id), current_user.id, person_data)
        if not person:
            return error_response(message="Pessoa não encontrada", status_code=status.HTTP_404_NOT_FOUND)
        return success_response(message="Pessoa atualizada com sucesso", data={"person": person.model_dump(mode='json')})
    except ValueError as e:
        return error_response(message=str(e), status_code=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return error_response(message="Erro interno do servidor", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

@router.delete("/people/{person_id}")
def delete_person(
    person_id: str,
    current_user: UserDTO = Depends(get_current_user_data),
    usecases: DebtUseCases = Depends(get_debt_usecases)
):
    try:
        success = usecases.delete_person(uuid.UUID(person_id), current_user.id)
        if not success:
            return error_response(message="Pessoa não encontrada", status_code=status.HTTP_404_NOT_FOUND)
        return success_response(message="Pessoa deletada com sucesso")
    except Exception as e:
        return error_response(message="Erro interno do servidor", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Endpoints para Dívidas

@router.get("/")
def list_debts(
    month: Optional[str] = Query(None, description="Mês no formato YYYY-MM"),
    person_id: Optional[str] = Query(None, description="ID da pessoa"),
    status: Optional[str] = Query(None, description="Status da dívida (pending, partial, paid)"),
    current_user: UserDTO = Depends(get_current_user_data),
    usecases: DebtUseCases = Depends(get_debt_usecases)
):
    try:
        month_date = None
        if month:
            try:
                year, month_num = month.split("-")
                month_date = date(int(year), int(month_num), 1)
            except ValueError:
                return error_response(message="Formato de mês inválido. Use YYYY-MM", status_code=status.HTTP_400_BAD_REQUEST)
        person_uuid = None
        if person_id:
            try:
                person_uuid = uuid.UUID(person_id)
            except ValueError:
                return error_response(message="ID da pessoa inválido", status_code=status.HTTP_400_BAD_REQUEST)
        debts = usecases.get_all_debts(current_user.id, month_date, person_uuid, status)
        return success_response(data={"debts": [DebtDTO.model_validate(debt, from_attributes=True).model_dump(mode="json") for debt in debts]})
    except Exception as e:
        return error_response(message="Erro interno do servidor", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

@router.post("/")
def create_debt(
    debt_data: DebtCreateDTO,
    current_user: UserDTO = Depends(get_current_user_data),
    usecases: DebtUseCases = Depends(get_debt_usecases)
):
    try:
        if debt_data.amount <= 0:
            return error_response(message="O valor da dívida deve ser positivo.", status_code=status.HTTP_400_BAD_REQUEST)
        if debt_data.total_installments is not None:
            if debt_data.total_installments < 1:
                return error_response(message="O número total de parcelas deve ser maior ou igual a 1.", status_code=status.HTTP_400_BAD_REQUEST)
            if debt_data.installments is not None and debt_data.installments > debt_data.total_installments:
                return error_response(message="A parcela atual não pode ser maior que o total de parcelas.", status_code=status.HTTP_400_BAD_REQUEST)
            if debt_data.due_date and debt_data.due_date < debt_data.date:
                return error_response(message="A data de vencimento não pode ser anterior à data da dívida.", status_code=status.HTTP_400_BAD_REQUEST)
        if debt_data.date > date.today():
            return error_response(message="A data da dívida não pode ser no futuro.", status_code=status.HTTP_400_BAD_REQUEST)
        debt = usecases.create_debt(current_user.id, debt_data)
        return success_response(message="Dívida criada com sucesso", data=DebtDTO.model_validate(debt, from_attributes=True).model_dump(mode="json"))
    except ValueError as e:
        return error_response(message=str(e), status_code=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return error_response(message="Erro interno do servidor", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

@router.get("/{debt_id}")
def get_debt(
    debt_id: str,
    current_user: UserDTO = Depends(get_current_user_data),
    usecases: DebtUseCases = Depends(get_debt_usecases)
):
    try:
        debt = usecases.get_debt_by_id(uuid.UUID(debt_id), current_user.id)
        if not debt:
            return error_response(message="Dívida não encontrada", status_code=status.HTTP_404_NOT_FOUND)
        return success_response(data={"debt": debt.model_dump(mode='json')})
    except Exception as e:
        return error_response(message="Erro interno do servidor", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

@router.put("/{debt_id}")
def update_debt(
    debt_id: str,
    debt_data: DebtUpdateDTO,
    current_user: UserDTO = Depends(get_current_user_data),
    usecases: DebtUseCases = Depends(get_debt_usecases)
):
    try:
        update_data = debt_data.model_dump(exclude_unset=True)
        if 'amount' in update_data and update_data['amount'] <= 0:
            return error_response(message="O valor da dívida deve ser positivo.", status_code=status.HTTP_400_BAD_REQUEST)
        if 'total_installments' in update_data:
            if update_data['total_installments'] < 1:
                return error_response(message="O número total de parcelas deve ser maior ou igual a 1.", status_code=status.HTTP_400_BAD_REQUEST)
            if 'installments' in update_data and update_data['installments'] > update_data['total_installments']:
                return error_response(message="A parcela atual não pode ser maior que o total de parcelas.", status_code=status.HTTP_400_BAD_REQUEST)
            if 'due_date' in update_data and 'date' in update_data and update_data['due_date'] < update_data['date']:
                return error_response(message="A data de vencimento não pode ser anterior à data da dívida.", status_code=status.HTTP_400_BAD_REQUEST)
        if 'date' in update_data and update_data['date'] > date.today():
            return error_response(message="A data da dívida não pode ser no futuro.", status_code=status.HTTP_400_BAD_REQUEST)
        debt = usecases.update_debt(uuid.UUID(debt_id), current_user.id, debt_data)
        if not debt:
            return error_response(message="Dívida não encontrada", status_code=status.HTTP_404_NOT_FOUND)
        return success_response(message="Dívida atualizada com sucesso", data=DebtDTO.model_validate(debt, from_attributes=True).model_dump(mode="json"))
    except ValueError as e:
        return error_response(message=str(e), status_code=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return error_response(message="Erro interno do servidor", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

@router.patch("/{debt_id}/payment")
def update_debt_payment(
    debt_id: str,
    payment_data: DebtPaymentDTO,
    current_user: UserDTO = Depends(get_current_user_data),
    usecases: DebtUseCases = Depends(get_debt_usecases)
):
    try:
        debt = usecases.update_debt_payment(uuid.UUID(debt_id), current_user.id, payment_data)
        if not debt:
            return error_response(message="Dívida não encontrada", status_code=status.HTTP_404_NOT_FOUND)
        return success_response(message="Pagamento atualizado com sucesso", data={"debt": debt.model_dump(mode='json')})
    except ValueError as e:
        return error_response(message=str(e), status_code=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return error_response(message="Erro interno do servidor", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

@router.delete("/{debt_id}")
def delete_debt(
    debt_id: str,
    current_user: UserDTO = Depends(get_current_user_data),
    usecases: DebtUseCases = Depends(get_debt_usecases)
):
    try:
        success = usecases.delete_debt(uuid.UUID(debt_id), current_user.id)
        if not success:
            return error_response(message="Dívida não encontrada", status_code=status.HTTP_404_NOT_FOUND)
        return success_response(message="Dívida deletada com sucesso")
    except Exception as e:
        return error_response(message="Erro interno do servidor", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

@router.get("/summary")
def get_debts_summary(
    month: str = Query(..., description="YYYY-MM"),
    current_user: UserDTO = Depends(get_current_user_data),
    usecases: DebtUseCases = Depends(get_debt_usecases)
):
    try:
        year, month_num = map(int, month.split('-'))
        month_date = date(year, month_num, 1)
        
        # Buscar dívidas do mês
        debts = usecases.get_all_debts(current_user.id, month_date, None, None)
        
        # Calcular totais
        total_debts = sum(float(debt.amount) for debt in debts)
        total_paid = sum(float(debt.paid_amount) for debt in debts)
        total_pending = total_debts - total_paid
        
        # Agrupar por pessoa
        debts_by_person = {}
        for debt in debts:
            person_name = debt.person.name
            if person_name not in debts_by_person:
                debts_by_person[person_name] = {
                    "total": 0.0,
                    "paid": 0.0,
                    "pending": 0.0,
                    "debts": []
                }
            debts_by_person[person_name]["total"] += float(debt.amount)
            debts_by_person[person_name]["paid"] += float(debt.paid_amount)
            debts_by_person[person_name]["pending"] += float(debt.amount) - float(debt.paid_amount)
            debts_by_person[person_name]["debts"].append(debt.model_dump(mode='json'))
        
        # Dívidas parceladas
        installments = [debt for debt in debts if debt.total_installments and debt.total_installments > 1]
        installments_out = [
            {
                "id": str(debt.id),
                "description": debt.description,
                "amount": float(debt.amount),
                "totalAmount": float(debt.amount) * (debt.total_installments or 1),
                "currentInstallment": debt.installments,
                "totalInstallments": debt.total_installments,
                "dueDate": debt.due_date.isoformat() if debt.due_date else None,
                "person": debt.person.name,
                "status": debt.status
            }
            for debt in installments
        ]
        
        return success_response(data={
            "summary": {
                "totalDebts": total_debts,
                "totalPaid": total_paid,
                "totalPending": total_pending,
                "installmentsCount": len(installments)
            },
            "debtsByPerson": debts_by_person,
            "installments": installments_out
        })
    except Exception as e:
        return error_response(message="Erro interno do servidor", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR) 
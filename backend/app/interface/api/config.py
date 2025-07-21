from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ...infrastructure.db import get_db
from ...infrastructure.models import CategoryModel
from ...infrastructure.models import RelationshipModel
from ...domain.dto.category import CategoryDTO, CategoryCreateDTO, CategoryUpdateDTO
from ...domain.dto.relationship import RelationshipDTO
from ...interface.api.dependencies import get_current_user
from ...infrastructure.repositories.category_repository import CategoryRepository

router = APIRouter(prefix="/config", tags=["Configurações"])

@router.get("/categories")
def get_categories(db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
    repo = CategoryRepository(db)
    categories = repo.get_all()
    return {
        "success": True,
        "data": {
            "categories": [cat.model_dump(mode='json') for cat in categories]
        }
    }

@router.post("/categories")
def create_category(category_data: CategoryCreateDTO, db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
    repo = CategoryRepository(db)
    category = repo.create(category_data.dict())
    return {
        "success": True,
        "message": "Categoria criada com sucesso",
        "data": {"category": category.model_dump(mode='json')}
    }

@router.put("/categories/{category_id}")
def update_category(category_id: str, update_data: CategoryUpdateDTO, db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
    repo = CategoryRepository(db)
    category = repo.update(category_id, update_data.dict(exclude_unset=True))
    if not category:
        return {"success": False, "message": "Categoria não encontrada"}
    return {
        "success": True,
        "message": "Categoria atualizada com sucesso",
        "data": {"category": category.model_dump(mode='json')}
    }

@router.delete("/categories/{category_id}")
def delete_category(category_id: str, db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
    repo = CategoryRepository(db)
    success = repo.delete(category_id)
    if not success:
        return {"success": False, "message": "Categoria não encontrada"}
    return {"success": True, "message": "Categoria removida com sucesso"}

@router.get("/relationships")
def get_relationships(db: Session = Depends(get_db), user_id: str = Depends(get_current_user)):
    relationships = db.query(RelationshipModel).all()
    return {
        "success": True,
        "data": {
            "relationships": [RelationshipDTO.model_validate(rel).model_dump(mode='json') for rel in relationships]
        }
    } 
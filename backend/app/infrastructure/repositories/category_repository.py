from sqlalchemy.orm import Session
from ..models.category import CategoryModel
from ...domain.dto.category import CategoryDTO

class CategoryRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def get_all(self) -> list[CategoryDTO]:
        """Busca todas as categorias"""
        categories = self.db.query(CategoryModel).all()
        return [CategoryDTO.model_validate(category) for category in categories]
    
    def get_by_id(self, category_id: str) -> CategoryDTO | None:
        """Busca uma categoria por ID"""
        category = self.db.query(CategoryModel).filter(
            CategoryModel.id == category_id
        ).first()
        
        if not category:
            return None
            
        return CategoryDTO.model_validate(category) 

    def create(self, category_data):
        """Cria uma nova categoria"""
        category = CategoryModel(**category_data)
        self.db.add(category)
        self.db.commit()
        self.db.refresh(category)
        return CategoryDTO.model_validate(category)

    def update(self, category_id: str, update_data: dict):
        """Atualiza uma categoria existente"""
        category = self.db.query(CategoryModel).filter(CategoryModel.id == category_id).first()
        if not category:
            return None
        for key, value in update_data.items():
            setattr(category, key, value)
        self.db.commit()
        self.db.refresh(category)
        return CategoryDTO.model_validate(category)

    def delete(self, category_id: str):
        """Remove uma categoria"""
        category = self.db.query(CategoryModel).filter(CategoryModel.id == category_id).first()
        if not category:
            return False
        self.db.delete(category)
        self.db.commit()
        return True 
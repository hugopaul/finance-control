from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from ..models.user import UserModel
from ...domain.dto.user import UserDTO, UserCreateDTO

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_email(self, email: str) -> UserModel | None:
        return self.db.query(UserModel).filter(UserModel.email == email).first()

    def get_by_id(self, user_id: str) -> UserModel | None:
        return self.db.query(UserModel).filter(UserModel.id == user_id).first()

    def create(self, name: str, email: str, password: str, avatar: str = None) -> UserModel | None:
        user = UserModel(
            name=name,
            email=email,
            password_hash=password,
            avatar=avatar
        )
        self.db.add(user)
        try:
            self.db.commit()
            self.db.refresh(user)
            return user
        except IntegrityError:
            self.db.rollback()
            return None 
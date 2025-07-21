from app.infrastructure.models import GoalModel
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

class GoalRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(self, user_id: str) -> List[GoalModel]:
        return self.db.query(GoalModel).filter(GoalModel.user_id == user_id).all()

    def get(self, user_id: str, goal_id: str) -> Optional[GoalModel]:
        return self.db.query(GoalModel).filter(GoalModel.user_id == user_id, GoalModel.id == goal_id).first()

    def create(self, user_id: str, data: dict) -> GoalModel:
        goal = GoalModel(id=str(uuid.uuid4()), user_id=user_id, **data)
        self.db.add(goal)
        self.db.commit()
        self.db.refresh(goal)
        return goal

    def update(self, user_id: str, goal_id: str, data: dict) -> Optional[GoalModel]:
        goal = self.get(user_id, goal_id)
        if not goal:
            return None
        for k, v in data.items():
            setattr(goal, k, v)
        self.db.commit()
        self.db.refresh(goal)
        return goal

    def delete(self, user_id: str, goal_id: str) -> bool:
        goal = self.get(user_id, goal_id)
        if not goal:
            return False
        self.db.delete(goal)
        self.db.commit()
        return True 
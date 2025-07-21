from app.infrastructure.repositories.goal_repository import GoalRepository
from app.domain.dto.goal import GoalDTO, GoalCreateDTO, GoalUpdateDTO
from typing import List, Optional

class GoalUseCases:
    def __init__(self, db):
        self.repo = GoalRepository(db)

    def list_goals(self, user_id: str) -> List[GoalDTO]:
        return [GoalDTO.model_validate(goal) for goal in self.repo.list(user_id)]

    def get_goal(self, user_id: str, goal_id: str) -> Optional[GoalDTO]:
        goal = self.repo.get(user_id, goal_id)
        if not goal:
            return None
        return GoalDTO.model_validate(goal)

    def create_goal(self, user_id: str, data: GoalCreateDTO) -> GoalDTO:
        goal = self.repo.create(user_id, data.dict())
        return GoalDTO.model_validate(goal)

    def update_goal(self, user_id: str, goal_id: str, data: GoalUpdateDTO) -> Optional[GoalDTO]:
        update_data = {k: v for k, v in data.dict().items() if v is not None}
        goal = self.repo.update(user_id, goal_id, update_data)
        if not goal:
            return None
        return GoalDTO.model_validate(goal)

    def delete_goal(self, user_id: str, goal_id: str) -> bool:
        return self.repo.delete(user_id, goal_id) 
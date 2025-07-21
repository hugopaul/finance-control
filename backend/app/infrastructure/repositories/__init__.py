# Este arquivo torna o diretório repositories um pacote Python

from .user_repository import UserRepository
from .category_repository import CategoryRepository
from .transaction_repository import TransactionRepository
from .relationship_repository import RelationshipRepository
from .people_repository import PeopleRepository
from .debt_repository import DebtRepository

__all__ = [
    'UserRepository',
    'CategoryRepository', 
    'TransactionRepository',
    'RelationshipRepository',
    'PeopleRepository',
    'DebtRepository'
] 
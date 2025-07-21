# Import models from separate files
from .user import UserModel
from .category import CategoryModel
from .transaction import TransactionModel
from .relationship import RelationshipModel
from .people import PeopleModel
from .debt import DebtsModel
from .goal import GoalModel
from .payment_method import PaymentMethodModel

__all__ = [
    'UserModel',
    'CategoryModel',
    'TransactionModel',
    'RelationshipModel',
    'PeopleModel',
    'DebtsModel',
    'GoalModel',
    'PaymentMethodModel'
] 
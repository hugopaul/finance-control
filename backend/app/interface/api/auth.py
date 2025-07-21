from fastapi import APIRouter, status, Depends
from pydantic import BaseModel, EmailStr, Field, validator
from .utils import success_response, error_response
from sqlalchemy.orm import Session
from app.infrastructure.db import SessionLocal
from app.infrastructure.repositories import UserRepository
from app.infrastructure.jwt_utils import create_access_token, create_refresh_token, verify_token
from app.interface.api.dependencies import get_current_user
from passlib.context import CryptContext
import traceback

router = APIRouter(prefix="/auth", tags=["Auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1)
    email: EmailStr
    password: str = Field(..., min_length=6)
    confirmPassword: str

    @validator("confirmPassword")
    def passwords_match(cls, v, values):
        if "password" in values and v != values["password"]:
            raise ValueError("As senhas não coincidem")
        return v

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

@router.post("/register", status_code=201)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    try:
        repo = UserRepository(db)
        if repo.get_by_email(req.email):
            return error_response(
                message="Dados inválidos",
                errors={"email": ["Email já está em uso"]},
                status_code=status.HTTP_400_BAD_REQUEST
            )
        hashed_password = pwd_context.hash(req.password)
        user = repo.create(name=req.name, email=req.email, password=hashed_password)
        if not user:
            return error_response(
                message="Erro ao criar usuário",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Gerar tokens JWT
        access_token = create_access_token(data={"sub": str(user.id)})
        refresh_token = create_refresh_token(data={"sub": str(user.id)})
        
        return success_response(
            message="Conta criada com sucesso",
            data={
                "user": {
                    "id": str(user.id),
                    "name": user.name,
                    "email": user.email,
                    "avatar": user.avatar,
                    "createdAt": user.created_at.isoformat()
                },
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer"
            }
        )
    except Exception as e:
        return error_response(
            message=f"Erro interno: {str(e)}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    try:
        repo = UserRepository(db)
        user = repo.get_by_email(req.email)
        if not user or not pwd_context.verify(req.password, user.password_hash):
            return error_response(
                message="Email ou senha incorretos",
                status_code=status.HTTP_401_UNAUTHORIZED
            )
        
        # Gerar tokens JWT
        access_token = create_access_token(data={"sub": str(user.id)})
        refresh_token = create_refresh_token(data={"sub": str(user.id)})
        
        return success_response(
            message="Login realizado com sucesso",
            data={
                "user": {
                    "id": str(user.id),
                    "name": user.name,
                    "email": user.email,
                    "avatar": user.avatar,
                    "createdAt": user.created_at.isoformat()
                },
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer"
            }
        )
    except Exception as e:
        return error_response(
            message=f"Erro interno: {str(e)}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@router.post("/refresh")
def refresh_token(req: RefreshTokenRequest):
    try:
        payload = verify_token(req.refresh_token)
        if not payload or payload.get("type") != "refresh":
            return error_response(
                message="Refresh token inválido",
                status_code=status.HTTP_401_UNAUTHORIZED
            )
        
        user_id = payload.get("sub")
        if not user_id:
            return error_response(
                message="Token inválido",
                status_code=status.HTTP_401_UNAUTHORIZED
            )
        
        # Gerar novo access token
        access_token = create_access_token(data={"sub": user_id})
        
        return success_response(
            message="Token renovado com sucesso",
            data={
                "access_token": access_token,
                "token_type": "bearer"
            }
        )
    except Exception as e:
        return error_response(
            message=f"Erro interno: {str(e)}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@router.get("/me")
def get_current_user_info(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        repo = UserRepository(db)
        user = repo.get_by_id(current_user)
        if not user:
            return error_response(
                message="Usuário não encontrado",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        return success_response(
            message="Informações do usuário",
            data={
                "user": {
                    "id": str(user.id),
                    "name": user.name,
                    "email": user.email,
                    "avatar": user.avatar,
                    "createdAt": user.created_at.isoformat()
                }
            }
        )
    except Exception as e:
        return error_response(
            message=f"Erro interno: {str(e)}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        ) 
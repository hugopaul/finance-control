from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from .config import DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME

DATABASE_URL = f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL, echo=True, future=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db() -> Session:
    """Dependency para obter a sessão do banco de dados"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 
from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from fastapi.middleware.cors import CORSMiddleware
from .utils import success_response
from .auth import router as auth_router
from .finance import router as finance_router, goals_router, payment_router
from .debts import router as debts_router
from .config import router as config_router
import os

app = FastAPI()

# Configuração de CORS
allow_origins = os.getenv("CORS_ALLOW_ORIGINS", "https://controle.solidtechsolutions.com.br").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Controle Financeiro API",
        version="1.0.0",
        description="API para controle financeiro pessoal",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }
    for path in openapi_schema["paths"].values():
        for method in path.values():
            method.setdefault("security", [{"BearerAuth": []}])
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

@app.get("/")
def read_root():
    return success_response(message="Backend FastAPI rodando!")

@app.get("/health")
def health_check():
    return success_response(message="Backend está saudável!")

app.include_router(auth_router)
app.include_router(finance_router)
app.include_router(goals_router)
app.include_router(payment_router)
app.include_router(debts_router)
app.include_router(config_router) 
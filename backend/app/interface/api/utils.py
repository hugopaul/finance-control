from fastapi.responses import JSONResponse
from typing import Any, Dict, Optional
from fastapi import status

def success_response(data: Any = None, message: str = "Sucesso"):
    return JSONResponse(
        status_code=200,
        content={
            "success": True,
            "message": message,
            "data": data
        }
    )

def error_response(message: str, errors: Optional[Dict[str, list]] = None, status_code: int = 400):
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "message": message,
            "errors": errors or {}
        }
    ) 
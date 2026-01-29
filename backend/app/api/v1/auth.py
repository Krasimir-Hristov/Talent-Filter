from fastapi import APIRouter, HTTPException, Depends
from supabase import Client
from app.schemas.auth import UserRegisterRequest, UserLoginRequest, AuthResponse
from app.api.deps import get_supabase_client

router = APIRouter()


@router.post("/register", response_model=AuthResponse)
async def register(
    request: UserRegisterRequest, supabase: Client = Depends(get_supabase_client)
):
    try:
        auth_response = supabase.auth.sign_up(
            {
                "email": request.email,
                "password": request.password,
                "options": {
                    "data": {
                        "full_name": request.full_name,
                        "company_name": request.company_name,
                    }
                },
            }
        )

        if not auth_response.user:
            raise HTTPException(status_code=400, detail="Registration failed")

        access_token = (
            auth_response.session.access_token
            if auth_response.session
            else "pending_verification"
        )

        return {
            "access_token": access_token,
            "user": {"id": auth_response.user.id, "email": auth_response.user.email},
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=AuthResponse)
async def login(
    request: UserLoginRequest, supabase: Client = Depends(get_supabase_client)
):
    try:
        auth_response = supabase.auth.sign_in_with_password(
            {"email": request.email, "password": request.password}
        )

        if not auth_response.session:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        return {
            "access_token": auth_response.session.access_token,
            "user": {"id": auth_response.user.id, "email": auth_response.user.email},
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

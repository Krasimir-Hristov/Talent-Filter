from fastapi import APIRouter, HTTPException, Depends
from supabase import Client, create_client
import os
from app.schemas.auth import UserRegisterRequest, UserLoginRequest, AuthResponse

router = APIRouter()


# Dependency manually created here for now, better to move to core/deps later
def get_supabase() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv(
        "SUPABASE_SECRET_KEY"
    )  # Use Service Role for admin tasks, but for Auth we actually need connection
    if not url or not key:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    return create_client(url, key)


@router.post("/register", response_model=AuthResponse)
async def register(
    request: UserRegisterRequest, supabase: Client = Depends(get_supabase)
):
    try:
        # Supabase Auth Sign Up
        # Note: Using service_role key lets us auto-confirm if needed,
        # but standard flow sends email. ideally use public key for client-side mimicking
        auth_response = supabase.auth.sign_up(
            {
                "email": request.email,
                "password": request.password,
                "options": {"data": {"full_name": request.full_name}},
            }
        )

        if not auth_response.user:
            raise HTTPException(status_code=400, detail="Registration failed")

        # Creating the session manually or returning what Supabase gave
        # Note: sign_up often creates a session only if email auto-confirm is on.
        return {
            "access_token": (
                auth_response.session.access_token
                if auth_response.session
                else "pending_verification"
            ),
            "user": {"id": auth_response.user.id, "email": auth_response.user.email},
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=AuthResponse)
async def login(request: UserLoginRequest, supabase: Client = Depends(get_supabase)):
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

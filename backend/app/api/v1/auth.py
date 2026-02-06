from fastapi import APIRouter, HTTPException, Depends, Response
from supabase import Client
from app.schemas.auth import UserRegisterRequest, UserLoginRequest, AuthResponse
from app.api.deps import get_service_role_client
import json

router = APIRouter()

COOKIE_NAME = "tf_session"
COOKIE_MAX_AGE = 60 * 60 * 24 * 7  # 7 days


@router.post("/register", response_model=AuthResponse)
async def register(
    request: UserRegisterRequest, supabase: Client = Depends(get_service_role_client)
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
            "user": {
                "id": auth_response.user.id,
                "email": auth_response.user.email,
                "full_name": auth_response.user.user_metadata.get("full_name"),
            },
        }
    except Exception as e:
        print(f"Registration error detailed: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=AuthResponse)
async def login(
    request: UserLoginRequest,
    response: Response,
    supabase: Client = Depends(get_service_role_client),
):
    try:
        auth_response = supabase.auth.sign_in_with_password(
            {"email": request.email, "password": request.password}
        )

        if not auth_response.session:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        user_data = {
            "id": auth_response.user.id,
            "email": auth_response.user.email,
            "full_name": auth_response.user.user_metadata.get("full_name"),
        }

        # Set the session cookie directly from the backend
        cookie_value = json.dumps(
            {
                "token": auth_response.session.access_token,
                "user": user_data,
            }
        )

        response.set_cookie(
            key=COOKIE_NAME,
            value=cookie_value,
            max_age=COOKIE_MAX_AGE,
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite="lax",
            path="/",
        )

        return {
            "access_token": auth_response.session.access_token,
            "user": user_data,
        }
    except Exception as e:
        error_msg = str(e)
        print(f"Login error detailed: {error_msg}")

        if "Email not confirmed" in error_msg:
            raise HTTPException(
                status_code=403,
                detail="Please confirm your email address before logging in.",
            )

        raise HTTPException(status_code=400, detail=error_msg)


@router.post("/logout")
async def logout(response: Response):
    """Clear the session cookie."""
    response.delete_cookie(key=COOKIE_NAME, path="/")
    return {"message": "Logged out successfully"}

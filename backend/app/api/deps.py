from fastapi import Depends, HTTPException, status, Request
from supabase import Client, create_client
import os

COOKIE_NAME = "tf_session"


def get_service_role_client() -> Client:
    """
    Returns a Supabase client with the SECRET (Service Role) key.
    Use ONLY for admin tasks.
    """
    url = os.getenv("SUPABASE_URL")
    # Modern format is sb_secret_..., legacy is SERVICE_ROLE
    key = os.getenv("SUPABASE_SECRET_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise HTTPException(status_code=500, detail="Supabase SECRET key missing")
    return create_client(url, key)


def get_anon_client() -> Client:
    """
    Returns a Supabase client with the PUBLISHABLE (Anon) key.
    Use for unauthenticated endpoints like Login/Register.
    """
    url = os.getenv("SUPABASE_URL")
    # Modern format is sb_publishable_..., legacy is ANON_KEY
    key = os.getenv("SUPABASE_PUBLISHABLE_KEY") or os.getenv("SUPABASE_ANON_KEY")
    if not url or not key:
        raise HTTPException(status_code=500, detail="Supabase PUBLISHABLE key missing")
    return create_client(url, key)


def get_token_from_cookie(request: Request) -> str:
    """
    Extracts the JWT access token from the tf_session HTTP-only cookie.
    The cookie contains a JSON object: { "token": "...", "user": {...} }
    """
    import json
    from urllib.parse import unquote

    cookie_value = request.cookies.get(COOKIE_NAME)
    if not cookie_value:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated. Session cookie missing.",
        )

    try:
        # The cookie is URL-encoded JSON, decode it first
        decoded_value = unquote(cookie_value)
        session_data = json.loads(decoded_value)
        token = session_data.get("token")
        if not token:
            raise HTTPException(
                status_code=401,
                detail="Invalid session format. Token missing.",
            )
        return token
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=401,
            detail="Invalid session cookie format.",
        )


def get_authenticated_client(
    token: str = Depends(get_token_from_cookie),
) -> Client:
    """
    Returns a Supabase client initialized with the USER'S access token.
    This client respects RLS policies for the authenticated user.
    """
    url = os.getenv("SUPABASE_URL")
    # IMPORTANT: To ensure RLS is ENFORCED, we must initialize with the PUBLISHABLE key,
    # then override the Authorization header with the user's JWT.
    key = os.getenv("SUPABASE_PUBLISHABLE_KEY") or os.getenv("SUPABASE_ANON_KEY")

    if not url or not key:
        # If publishable key is missing, we fall back to SECRET_KEY BUT this is less secure
        # as it might bypass RLS depending on the SDK version.
        key = os.getenv("SUPABASE_SECRET_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        if not url or not key:
            raise HTTPException(
                status_code=500, detail="Supabase configuration missing"
            )

    client = create_client(url, key)
    # Set the user's token for Postgrest (RLS) directly to avoid refresh token issues
    client.postgrest.auth(token)
    return client


async def get_current_user(
    token: str = Depends(get_token_from_cookie),
    supabase: Client = Depends(get_authenticated_client),
) -> dict:
    """
    Validates the JWT token by asking Supabase 'getUser()'.
    Since 'supabase' here is already the authenticated client,
    calling get_user() checks validity against Supabase Auth.
    """
    try:
        user_response = supabase.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid authentication token")
        return user_response.user
    except Exception as e:
        print(f"Auth Error: {e}")
        raise HTTPException(status_code=401, detail="Could not validate credentials")

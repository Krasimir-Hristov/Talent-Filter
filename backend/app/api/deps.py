import os
import time
import json
from collections import defaultdict
from urllib.parse import unquote
from fastapi import Depends, HTTPException, status, Request
from supabase import Client, create_client
from supabase.lib.client_options import SyncClientOptions as ClientOptions

COOKIE_NAME = "tf_session"


def _is_opaque_key(key: str) -> bool:
    """Check if the key is a new opaque format (sb_secret_ or sb_publishable_)."""
    return key.startswith("sb_secret_") or key.startswith("sb_publishable_")


def _create_supabase_client(url: str, key: str) -> Client:
    """
    Create a Supabase client that works with both legacy JWT keys and new opaque keys.

    For new opaque keys (sb_secret_/sb_publishable_), we must NOT send the key
    in the Authorization header - only in apikey header. The Supabase API Gateway
    will mint a temporary JWT from the opaque key.
    """
    import logging

    logger = logging.getLogger("uvicorn")

    if _is_opaque_key(key):
        logger.info(f"DEBUG: Initializing client with opaque key prefix: {key[:15]}...")
        # For opaque keys, we need to override the Authorization header
        # to prevent SDK from sending "Bearer sb_secret_..." which is invalid
        options = ClientOptions(
            headers={
                "Authorization": "",  # Send empty string to override default, prevents httpx crash with None
            }
        )
        return create_client(url, key, options)
    else:
        # Legacy JWT keys work normally
        logger.info(f"DEBUG: Initializing client with legacy key")
        return create_client(url, key)


# Simple memory-based rate limiter
class SimpleRateLimiter:
    def __init__(self, requests_per_minute: int = 30):
        self.limits = defaultdict(list)
        self.requests_per_minute = requests_per_minute

    def is_allowed(self, key: str) -> bool:
        now = time.time()
        self.limits[key] = [t for t in self.limits[key] if now - t < 60]
        if len(self.limits[key]) >= self.requests_per_minute:
            return False
        self.limits[key].append(now)
        return True


_rate_limiter = SimpleRateLimiter(30)  # 30 requests per minute per IP


async def rate_limit(request: Request):
    client_ip = request.headers.get("x-forwarded-for") or request.client.host
    if not _rate_limiter.is_allowed(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please try again later.",
        )


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
    return _create_supabase_client(url, key)


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
    return _create_supabase_client(url, key)


def get_token_from_cookie(request: Request) -> str:
    """
    Extracts the JWT access token from the tf_session HTTP-only cookie.
    The cookie contains a JSON object: { "token": "...", "user": {...} }
    """
    # imports are at top level

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

    # For authenticated clients, we always use the user's JWT token
    # This works with both legacy and opaque keys
    options = ClientOptions(
        headers={
            "Authorization": f"Bearer {token}",
        }
    )
    return create_client(url, key, options)


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

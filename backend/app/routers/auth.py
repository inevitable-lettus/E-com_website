from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from authlib.integrations.starlette_client import OAuth, OAuthError
from starlette.config import Config
from ..database import get_db
from ..models.user import User
from ..schemas.user import UserCreate, UserOut
from ..utils.auth import create_access_token
from ..config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])

config = Config(environ={
    "GOOGLE_CLIENT_ID": settings.GOOGLE_CLIENT_ID,
    "GOOGLE_CLIENT_SECRET": settings.GOOGLE_CLIENT_SECRET,
})
oauth = OAuth(config)
oauth.register(
    name="google",
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)


@router.get("/google/login")
async def google_login(request: Request):
    redirect_uri = settings.GOOGLE_REDIRECT_URI
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    try:
        token = await oauth.google.authorize_access_token(request)
    except OAuthError as e:
        raise HTTPException(status_code=400, detail=str(e))

    user_info = token.get("userinfo")
    if not user_info:
        raise HTTPException(status_code=400, detail="Failed to get user info from Google")

    user = db.query(User).filter(User.google_id == user_info["sub"]).first()
    if not user:
        user = db.query(User).filter(User.email == user_info["email"]).first()
    if not user:
        user = User(
            email=user_info["email"],
            name=user_info.get("name", ""),
            google_id=user_info["sub"],
            profile_pic=user_info.get("picture"),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        if not user.google_id:
            user.google_id = user_info["sub"]
        if not user.profile_pic:
            user.profile_pic = user_info.get("picture")
        db.commit()

    access_token = create_access_token(data={"sub": str(user.id)})
    return RedirectResponse(url=f"{settings.FRONTEND_URL}/auth/callback?token={access_token}")


@router.post("/demo-login")
def demo_login(name: str, email: str, db: Session = Depends(get_db)):
    """Demo login for presentation purposes — no real OAuth needed."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email, name=name, wallet_balance=500.0)
        db.add(user)
        db.commit()
        db.refresh(user)
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer", "user": UserOut.model_validate(user)}


@router.get("/me", response_model=UserOut)
def get_me(db: Session = Depends(get_db), token: str = None):
    from ..utils.auth import get_current_user
    from fastapi.security import OAuth2PasswordBearer
    # handled via dependency in other routes
    pass

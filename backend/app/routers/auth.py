from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import create_access_token, get_password_hash, verify_password
from app.dependencies.auth import get_current_user
from app.models.enums import UserRole, UserStatus
from app.models.models import User
from app.schemas.schemas import TokenResponse, UserLogin, UserRegister, UserResponse

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)) -> User:
    if payload.rol == UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede registrar un ADMIN desde el endpoint publico",
        )
    existing = db.scalar(select(User).where(User.email == str(payload.email).lower()))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El email ya esta registrado")

    user = User(
        nombre=payload.nombre,
        email=str(payload.email).lower(),
        password_hash=get_password_hash(payload.password),
        telefono=payload.telefono,
        rol=payload.rol,
        estado=UserStatus.ACTIVO,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.scalar(select(User).where(User.email == str(payload.email).lower()))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
        )
    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse)
def auth_me(current_user: User = Depends(get_current_user)) -> User:
    return current_user

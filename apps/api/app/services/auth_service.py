from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest


class EmailAlreadyRegisteredError(Exception):
    """Raised when attempting to register an email that already exists."""


class InvalidCredentialsError(Exception):
    """Raised when login email or password is invalid."""


class AuthService:
    def __init__(self, db: Session) -> None:
        self._users = UserRepository(db)

    def register_user(self, payload: RegisterRequest) -> User:
        if self._users.get_by_email(payload.email) is not None:
            raise EmailAlreadyRegisteredError("Email já cadastrado")

        password_hash = hash_password(payload.password)
        return self._users.create(
            name=payload.name,
            email=payload.email,
            password_hash=password_hash,
        )

    def login_user(self, payload: LoginRequest) -> User:
        user = self._users.get_by_email(payload.email)
        if user is None or not verify_password(payload.password, user.password_hash):
            raise InvalidCredentialsError("Email ou senha inválidos")
        return user

import os
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

os.environ["DATABASE_URL"] = "sqlite://"
os.environ["SECRET_KEY"] = "test-secret"

from app.core.database import Base, get_db  # noqa: E402
from app.core.security import get_password_hash  # noqa: E402
from app.main import app  # noqa: E402
from app.models.enums import UserRole, UserStatus  # noqa: E402
from app.models.models import User, TipoAcoplado  # noqa: E402

test_engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(bind=test_engine, autocommit=False, autoflush=False)


@pytest.fixture(autouse=True)
def database() -> Generator[None, None, None]:
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()
    from app.models.models import TipoTarifa
    session.add(
        User(
            nombre="Admin Test",
            email="admin@test.com",
            password_hash=get_password_hash("Admin123!"),
            telefono=None,
            rol=UserRole.ADMIN,
            estado=UserStatus.ACTIVO,
        )
    )
    session.add_all([
        TipoTarifa(id=1, nombre="Por Kilómetro"),
        TipoTarifa(id=2, nombre="Por Tonelada"),
        TipoTarifa(id=3, nombre="Tarifa Plana"),
    ])
    session.add_all([
        TipoAcoplado(id=1, nombre="Batea"),
        TipoAcoplado(id=2, nombre="Semirremolque"),
        TipoAcoplado(id=3, nombre="Sider"),
        TipoAcoplado(id=4, nombre="Equipo"),
        TipoAcoplado(id=5, nombre="Tolva"),
        TipoAcoplado(id=6, nombre="Bitren"),
        TipoAcoplado(id=7, nombre="Carreton"),
        TipoAcoplado(id=8, nombre="PortaCont"),
    ])
    session.commit()
    session.close()

    def override_get_db() -> Generator[Session, None, None]:
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    yield
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)

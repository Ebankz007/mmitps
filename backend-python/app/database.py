from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

# PostgreSQL (asyncpg driver). Override via DATABASE_URL in backend-python/.env
# or the parent project .env. Default targets the local dev database.
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://mmitps_user:mmitps_dev_pass_2026@localhost:5433/mmitps_dev",
)

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
from os import getenv
from typing import Annotated, AsyncGenerator

from fastapi import Depends
from sqlmodel import Field, Session, SQLModel
from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel.ext.asyncio.session import AsyncSession


class Campaign(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)


class CampaignNameUpdate(SQLModel):
    name: str


class Settlement(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    campaign: int = Field(foreign_key='campaign.id')


class CreateSettlement(SQLModel):
    name: str
    campaign: int


class GetSettlementsByCampaign(SQLModel):
    campaign: int


class Asset(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True, foreign_key='settlement.id')
    income: int
    coffers: int
    resources: int
    defence: int


class AssetModel(SQLModel):
    income: int = Field(default=0)
    coffers: int = Field(default=0)
    resources: int = Field(default=0)
    defence: int = Field(default=0)


class Event(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    settlement_id: int | None = Field(foreign_key='settlement.id')
    name: str
    description: str
    resolved: bool = Field(default=False)


class CreateEvent(SQLModel):
    settlement_id: int
    name: str
    description: str
    resolved: bool = Field(default=False)


class ResolveEvent(SQLModel):
    resolved: bool = Field(default=True)


class EventResolution(SQLModel, table=True):

    __tablename__ = 'event_resolution'

    id: int | None = Field(default=None, primary_key=True)
    event_id: int | None = Field(foreign_key='event.id')
    name: str
    description: str
    chosen: bool = Field(default=False)
    income: int
    coffers: int
    resources: int
    defence: int


class CreateEventResolution(SQLModel):
    event_id: int | None = Field(foreign_key='event.id')
    name: str
    description: str
    chosen: bool = Field(default=False)
    income: int
    coffers: int
    resources: int
    defence: int


class ChooseEventResolution(SQLModel):
    chosen: bool = Field(default=True)


class Building(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    settlement_id: int | None = Field(foreign_key='settlement.id')
    name: str
    description: str
    is_built: bool
    income: int
    coffers: int
    resources: int
    defence: int


class CreateBuilding(SQLModel):
    settlement_id: int | None = Field(foreign_key='settlement.id')
    name: str
    description: str
    is_built: bool
    income: int
    coffers: int
    resources: int
    defence: int


class MarkBuildingBuiltModel(SQLModel):
    is_built: bool = Field(default=True)



DATABASE_URL = getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set")

engine = create_async_engine(DATABASE_URL, pool_pre_ping=True)


async def create_db_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


async def get_session():
    async with AsyncSession(engine, expire_on_commit=False) as session:
        yield session


SessionDep = Annotated[AsyncSession, Depends(get_session)]

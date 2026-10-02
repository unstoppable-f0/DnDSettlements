from pathlib import Path
from typing import Annotated

from fastapi import Depends
from sqlmodel import Field, Session, SQLModel, create_engine, select


class Campaign(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)


class CampaignNameUpdate(SQLModel):
    name: str


class Settlement(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    campaign: str = Field(foreign_key='campaign.name')


class CreateSettlement(SQLModel):
    name: str
    campaign: str


class GetSettlementsByCampaign(SQLModel):
    campaign: str


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


sqlite_file_name = Path().cwd().joinpath('backend').joinpath('db').joinpath('settlements.db')
sqlite_url = f'sqlite:///{sqlite_file_name}'

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)


async def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


async def get_session():
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]

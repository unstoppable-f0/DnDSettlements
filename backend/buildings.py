from typing import Annotated

from fastapi import APIRouter, Query
from sqlmodel import select

from backend.db.models import Building, CreateBuilding, SessionDep

buildings_router = APIRouter(
    prefix='/buildings',
    tags=['buildings']
)


@buildings_router.get('/', response_model=list[Building])
async def get_all_buildings(session: SessionDep, offset: int = 0, limit: Annotated[int, Query(le=100)] = 100):
    all_buildings = session.exec(select(Building).offset(offset).limit(limit)).all()
    return all_buildings


@buildings_router.get('/{settlement_id}', response_model=list[Building])
async def get_buildings_by_settlement_id(settlement_id: int,
                                      session: SessionDep,
                                      offset: int = 0,
                                      limit: Annotated[int, Query(le=100)] = 100):


    buildings_by_campaign = session.exec(select(Building).where(Building.settlement_id == settlement_id).
                                           offset(offset).limit(limit)).all()

    return buildings_by_campaign



@buildings_router.post('/', response_model=Building)
async def create_buildings(building: CreateBuilding, session: SessionDep):
    db_building = Building.model_validate(building)
    session.add(db_building)
    session.commit()
    session.refresh(db_building)

    return db_building
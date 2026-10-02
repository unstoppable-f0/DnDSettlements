from typing import Annotated

from fastapi import APIRouter, Query, HTTPException
from sqlmodel import select

from backend.assets import recalculate_assets
from backend.db.models import Building, CreateBuilding, SessionDep, AssetModel, MarkBuildingBuiltModel

buildings_router = APIRouter(
    prefix='/buildings',
    tags=['buildings']
)


@buildings_router.get('/{building_id}', response_model=Building)
async def get_building_by_id(building_id: int, session: SessionDep):
    building = session.get(Building, building_id)
    if not building:
        raise HTTPException(status_code=404, detail='Building not found')

    return building


@buildings_router.get('/', response_model=list[Building])
async def get_all_buildings(session: SessionDep, offset: int = 0, limit: Annotated[int, Query(le=100)] = 100):
    all_buildings = session.exec(select(Building).offset(offset).limit(limit)).all()
    return all_buildings


@buildings_router.get('/settlements/{settlement_id}', response_model=list[Building])
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


@buildings_router.patch('/{building_id}', response_model=Building)
async def mark_building_as_built(building_id: int, session: SessionDep):
    db_building = session.get(Building, building_id)
    mark_as_built_data = MarkBuildingBuiltModel().model_dump()
    db_building.sqlmodel_update(mark_as_built_data)
    session.commit()
    session.refresh(db_building)

    return db_building


@buildings_router.patch('/build/{building_id}', response_model=Building)
async def build_building(building_id: int, session: SessionDep):

    building = await get_building_by_id(building_id, session)

    building_assets = AssetModel(
        income=building.income,
        coffers=building.coffers,
        resources=building.resources,
        defence=building.defence
    )

    settlement_id = building.settlement_id

    await recalculate_assets(settlement_id, building_assets, session)
    updated_building = await mark_building_as_built(building.id, session)

    return updated_building

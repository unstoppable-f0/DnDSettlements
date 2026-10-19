from fastapi import APIRouter, HTTPException

from backend.buildings.service import (
    complete_building_project,
    make_building_project,
    read_all_buildings,
    read_building_by_id,
    read_buildings_by_settlement_id,
)
from backend.db.models import Building, CreateBuilding, SessionDep

buildings_router = APIRouter(
    prefix='/buildings',
    tags=['buildings']
)


@buildings_router.get('/{building_id}', response_model=Building)
async def get_building_by_id(building_id: int, session: SessionDep):
    building = await read_building_by_id(building_id, session)
    if not building:
        raise HTTPException(status_code=404, detail='Building not found')

    return building


@buildings_router.get('/', response_model=list[Building])
async def get_all_buildings(session: SessionDep):
    all_buildings = await read_all_buildings(session)

    return all_buildings


@buildings_router.get('/settlements/{settlement_id}', response_model=list[Building])
async def get_buildings_by_settlement_id(settlement_id: int, session: SessionDep):
    buildings_by_campaign = await read_buildings_by_settlement_id(settlement_id, session)

    return buildings_by_campaign



@buildings_router.post('/', response_model=Building)
async def create_building_project(building: CreateBuilding, session: SessionDep):
    new_building = await make_building_project(building, session)

    return new_building


@buildings_router.patch('/{building_id}', response_model=Building)
async def mark_building_as_built(building_id: int, session: SessionDep):
    db_building = await mark_building_as_built(building_id, session)
    return db_building


@buildings_router.patch('/build/{building_id}', response_model=Building)
async def build_building(building_id: int, session: SessionDep):

    completed_building_project = await complete_building_project(building_id, session)

    return completed_building_project

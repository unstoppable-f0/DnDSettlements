from typing import Annotated

from fastapi import Query
from sqlmodel import select

from backend.assets.service import recalculate_assets
from backend.db.models import (AssetModel, Building, CreateBuilding,
                               MarkBuildingBuiltModel, SessionDep)


async def read_building_by_id(building_id: int, session: SessionDep) -> Building:
    building = session.get(Building, building_id)
    return building


async def read_all_buildings(session: SessionDep,
                             offset: int = 0,
                             limit: Annotated[int, Query(le=100)] = 100) -> list[Building]:

    all_buildings = session.exec(select(Building).offset(offset).limit(limit)).all()
    return all_buildings


async def read_buildings_by_settlement_id(settlement_id: int,
                                          session: SessionDep,
                                          offset: int = 0,
                                          limit: Annotated[int, Query(le=100)] = 100) -> list[Building]:

    buildings_by_settlement = session.exec(select(Building).where(Building.settlement_id == settlement_id).
                                         offset(offset).limit(limit)).all()
    return buildings_by_settlement


async def make_building_project(building: CreateBuilding, session: SessionDep) -> Building:
    db_building = Building.model_validate(building)
    session.add(db_building)
    session.commit()
    session.refresh(db_building)

    return db_building


async def mark_as_built(building_id: int, session: SessionDep) -> Building:
    db_building = session.get(Building, building_id)
    mark_as_built_data = MarkBuildingBuiltModel().model_dump()
    db_building.sqlmodel_update(mark_as_built_data)
    session.commit()
    session.refresh(db_building)

    return db_building


async def complete_building_project(building_id: int, session: SessionDep) -> Building:
    building = await read_building_by_id(building_id, session)

    building_assets = AssetModel(
        income=building.income,
        coffers=building.coffers,
        resources=building.resources,
        defence=building.defence
    )

    settlement_id = building.settlement_id

    await recalculate_assets(settlement_id, building_assets, session)
    updated_building = await mark_as_built(building.id, session)

    return updated_building
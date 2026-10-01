from typing import Annotated

from fastapi import APIRouter, HTTPException, Query
from sqlmodel import select

from backend.assets import recalculate_assets
from backend.db.models import (AssetModel, ChooseEventResolution,
                               CreateEventResolution, EventResolution,
                               SessionDep)
from backend.events import resolve_event

event_resolutions_router = APIRouter(
    prefix='/event_resolutions',
    tags=['event_resolutions']
)


@event_resolutions_router.get('/', response_model=list[EventResolution])
async def get_all_event_resolutions(session: SessionDep, offset: int = 0, limit: Annotated[int, Query(le=100)] = 100):
    all_event_resolutions = session.exec(select(EventResolution).offset(offset).limit(limit)).all()
    return all_event_resolutions


@event_resolutions_router.get('/{event_id}', response_model=list[EventResolution])
async def get_event_resolutions_by_event_id(event_id: int,
                                            session: SessionDep,
                                            offset: int = 0,
                                            limit: Annotated[int, Query(le=100)] = 100):


    event_resolutions_by_campaign = session.exec(select(EventResolution).where(EventResolution.event_id == event_id).
                                           offset(offset).limit(limit)).all()

    return event_resolutions_by_campaign



@event_resolutions_router.post('/', response_model=EventResolution)
async def create_event_resolution(event_resolution: CreateEventResolution, session: SessionDep):
    db_event_resolution = EventResolution.model_validate(event_resolution)
    session.add(db_event_resolution)
    session.commit()
    session.refresh(db_event_resolution)

    return db_event_resolution


@event_resolutions_router.patch('/{event_resolution_id}', response_model=EventResolution)
async def choose_event_resolution(event_resolution_id: int, session: SessionDep):
    db_event_resolution = session.get(EventResolution, event_resolution_id)
    if not db_event_resolution:
        raise HTTPException(status_code=404, detail='Event resolution not found')

    new_event_resolution_data = ChooseEventResolution().model_dump()
    db_event_resolution.sqlmodel_update(new_event_resolution_data)
    session.commit()
    session.refresh(db_event_resolution)

    return db_event_resolution

@event_resolutions_router.patch('/decide/{event_resolution_id}', response_model=EventResolution)
async def decide_on_event_resolution(event_resolution_id: int,
                                     session: SessionDep):

    """
    Handler for handling all event resolution logic:
    1) Choose the exact event resolution
    2) Mark the event as resolved
    3) Calculate and update the Settlement's assets
    """

    # UPDATE (PUT) the chosen event resolution. Grab the updated model
    event_resolution = await choose_event_resolution(event_resolution_id, session)
    resolution_assets = AssetModel(
        income=event_resolution.income,
        coffers=event_resolution.coffers,
        resources=event_resolution.resources,
        defence=event_resolution.defence
    )

    event_id = event_resolution.event_id

    # resolve the EVENT (update its boolean)
    resolved_event = await resolve_event(event_id, session)
    settlement_id = resolved_event.settlement_id

    await recalculate_assets(settlement_id, resolution_assets, session)

    return event_resolution

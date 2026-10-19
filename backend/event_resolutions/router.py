from typing import Annotated
from fastapi import APIRouter, HTTPException, Query

from backend.db.models import CreateEventResolution, EventResolution, SessionDep
from backend.event_resolutions.service import (
    decide_the_event_resolution,
    make_event_resolution,
    mark_as_chosen_resolution,
    read_all_event_resolutions,
    read_event_resolutions_by_id,
    read_chosen_resolution_by_event_id,
    read_many_chosen_resolutions,
)

event_resolutions_router = APIRouter(
    prefix='/event_resolutions',
    tags=['event_resolutions']
)


@event_resolutions_router.get('/', response_model=list[EventResolution])
async def get_all_event_resolutions(session: SessionDep):
    all_event_resolutions = await read_all_event_resolutions(session)
    if not all_event_resolutions:
        raise HTTPException(status_code=404, detail='No event resolutions found')
    return all_event_resolutions


@event_resolutions_router.get('/{event_id}', response_model=list[EventResolution])
async def get_event_resolutions_by_event_id(event_id: int, session: SessionDep):

    event_resolutions_by_campaign = await read_event_resolutions_by_id(event_id, session)
    if not event_resolutions_by_campaign:
        raise HTTPException(status_code=404, detail='No event resolutions found for that campaign')
    return event_resolutions_by_campaign


@event_resolutions_router.get('/chosen/{event_id}', response_model=EventResolution)
async def get_chosen_resolution_by_event_id(event_id: int, session: SessionDep):
    chosen_resolution = await read_chosen_resolution_by_event_id(event_id, session)

    if not chosen_resolution:
        raise HTTPException(status_code=404, detail='No event resolutions found for that campaign')
    return chosen_resolution


@event_resolutions_router.get('/many_chosen/', response_model=list[EventResolution])
async def get_many_chosen_resolutions(event_ids: Annotated[list[int] | None, Query()], session: SessionDep):
    chosen_resolutions = await read_many_chosen_resolutions(event_ids, session)
    if not chosen_resolutions:
        raise HTTPException(status_code=404, detail='No event resolutions found for that campaign')
    return chosen_resolutions


@event_resolutions_router.post('/', response_model=EventResolution)
async def create_event_resolution(event_resolution: CreateEventResolution, session: SessionDep):
    db_event_resolution = await make_event_resolution(event_resolution, session)
    if not db_event_resolution:
        raise HTTPException(status_code=404, detail='Could not create event resolution')

    return db_event_resolution


@event_resolutions_router.patch('/{event_resolution_id}', response_model=EventResolution)
async def choose_event_resolution(event_resolution_id: int, session: SessionDep):
    db_event_resolution = await mark_as_chosen_resolution(event_resolution_id, session)
    if not db_event_resolution:
        raise HTTPException(status_code=404, detail='Event resolution not found')

    return db_event_resolution

@event_resolutions_router.patch('/decide/{event_resolution_id}', response_model=EventResolution)
async def decide_on_event_resolution(event_resolution_id: int, session: SessionDep):
    event_resolution = await decide_the_event_resolution(event_resolution_id, session)

    return event_resolution

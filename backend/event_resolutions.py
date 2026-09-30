from typing import Annotated

from fastapi import APIRouter, Query, HTTPException
from sqlmodel import select, Session

from backend.db.models import (CreateEventResolution, EventResolution,
                               ChooseEventResolution, SessionDep)

event_resolutions_router = APIRouter(
    prefix='/event-resolutions',
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


@event_resolutions_router.patch('{event_resolution_id}', response_model=EventResolution)
async def choose_event_resolution(event_resolution_id: int,
                                  choose_resolution: ChooseEventResolution,
                                  session: SessionDep):
    db_event_resolution = session.get(EventResolution, event_resolution_id)

    if not db_event_resolution:
        raise HTTPException(status_code=404, detail='Event resolution not found')

    new_event_resolution_data = choose_resolution.model_dump(exclude_unset=True)
    db_event_resolution.sqlmodel_update(new_event_resolution_data)
    session.commit()
    session.refresh(db_event_resolution)
    return db_event_resolution



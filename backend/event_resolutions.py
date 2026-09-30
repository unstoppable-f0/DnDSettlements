from typing import Annotated

from fastapi import APIRouter, Query
from sqlmodel import select

from backend.db.models import (CreateEventResolution, EventResolution,
                               SessionDep)

event_resolutions_router = APIRouter(
    prefix='/event-resolutions',
    tags=['event_resolutions']
)


@event_resolutions_router.get('-resolutions/', response_model=list[EventResolution])
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
async def create_event(event_resolution: CreateEventResolution, session: SessionDep):
    db_event_resolution = EventResolution.model_validate(event_resolution)
    session.add(db_event_resolution)
    session.commit()
    session.refresh(db_event_resolution)

    return db_event_resolution

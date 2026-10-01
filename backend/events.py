from typing import Annotated

from fastapi import APIRouter, HTTPException, Query
from sqlmodel import select

from backend.db.models import CreateEvent, Event, ResolveEvent, SessionDep

events_router = APIRouter(
    prefix="/events",
    tags=['events']
)


@events_router.get('/', response_model=list[Event])
async def get_all_events(session: SessionDep, offset: int = 0, limit: Annotated[int, Query(le=100)] = 100):
    all_events = session.exec(select(Event).offset(offset).limit(limit)).all()
    return all_events


@events_router.get('/{settlement_id}', response_model=list[Event])
async def get_all_events_by_settlement_id(settlement_id: int,
                                          session: SessionDep,
                                          offset: int = 0,
                                          limit: Annotated[int, Query(le=100)] = 100):


    events_by_campaign = session.exec(select(Event).where(Event.settlement_id == settlement_id).
                                           offset(offset).limit(limit)).all()

    return events_by_campaign

@events_router.get('/unresolved/{settlement_id}', response_model=list[Event])
async def get_unresolved_events_by_settlement_id(settlement_id: int,
                                                 session: SessionDep,
                                                 offset: int = 0,
                                                 limit: Annotated[int, Query(le=100)] = 100):

    unresolved_settlement_events = session.exec(select(Event).where(Event.settlement_id == settlement_id).
                                                offset(offset).limit(limit)).all()

    return unresolved_settlement_events

@events_router.post('/', response_model=Event)
async def create_event(event: CreateEvent, session: SessionDep):
    db_event = Event.model_validate(event)
    session.add(db_event)
    session.commit()
    session.refresh(db_event)

    return db_event


async def resolve_event(event_id: int, session: SessionDep) -> Event:
    db_event = session.get(Event, event_id)
    if not db_event:
        raise HTTPException(status_code=404, detail='Event resolution not found')

    new_event_data = ResolveEvent().model_dump()
    db_event.sqlmodel_update(new_event_data)
    session.commit()
    session.refresh(db_event)

    return db_event

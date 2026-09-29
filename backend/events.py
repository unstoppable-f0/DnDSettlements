from typing import Annotated

from fastapi import APIRouter, Query
from sqlmodel import select
from backend.db.models import SessionDep, Event, CreateEvent


events_router = APIRouter()


@events_router.get('/events/', response_model=list[Event])
async def get_all_events(session: SessionDep, offset: int = 0, limit: Annotated[int, Query(le=100)] = 100):
    all_events = session.exec(select(Event).offset(offset).limit(limit)).all()
    return all_events


@events_router.get('/events/{settlement_id}', response_model=list[Event])
async def get_events_by_settlement_id(settlement_id: int,
                                      session: SessionDep,
                                      offset: int = 0,
                                      limit: Annotated[int, Query(le=100)] = 100):


    events_by_campaign = session.exec(select(Event).where(Event.settlement_id == settlement_id).
                                           offset(offset).limit(limit)).all()

    return events_by_campaign



@events_router.post('/events', response_model=Event)
async def create_event(event: CreateEvent, session: SessionDep):
    db_event = Event.model_validate(event)
    session.add(db_event)
    session.commit()
    session.refresh(db_event)

    return db_event
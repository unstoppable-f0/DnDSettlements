
from fastapi import APIRouter, HTTPException

from backend.db.models import CreateEvent, Event, SessionDep
from backend.events.service import (
    make_event,
    read_all_events,
    read_all_events_by_settlement_id,
    read_resolved_events_by_settlement_id,
    read_unresolved_events_by_settlement_id,
)

events_router = APIRouter(
    prefix="/events",
    tags=['events']
)


@events_router.get('/', response_model=list[Event])
async def get_all_events(session: SessionDep):
    all_events = await read_all_events(session)
    if not all_events:
        raise HTTPException(status_code=404, detail="No events found")
    return all_events


@events_router.get('/{settlement_id}', response_model=list[Event])
async def get_all_events_by_settlement_id(settlement_id: int, session: SessionDep):


    events_by_campaign = await read_all_events_by_settlement_id(settlement_id, session)
    if not events_by_campaign:
        raise HTTPException(status_code=404, detail="No events for that campaign found")

    return events_by_campaign

@events_router.get('/unresolved/{settlement_id}', response_model=list[Event])
async def get_unresolved_events_by_settlement_id(settlement_id: int, session: SessionDep):

    unresolved_settlement_events = await read_unresolved_events_by_settlement_id(settlement_id, session)
    if not unresolved_settlement_events:
        raise HTTPException(status_code=404, detail="No events found")

    return unresolved_settlement_events


@events_router.get('/resolved/{settlement_id}', response_model=list[Event])
async def get_resolved_events_by_settlement_id(settlement_id: int, session: SessionDep):
    resolved_settlement_events = await read_resolved_events_by_settlement_id(settlement_id, session)
    if not resolved_settlement_events:
        raise HTTPException(status_code=404, detail="No resolved events found")

    return resolved_settlement_events


@events_router.post('/', response_model=Event)
async def create_event(event: CreateEvent, session: SessionDep):
    db_event = make_event(event, session)
    if not db_event:
        raise HTTPException(status_code=404, detail="Could not create event ")
    return db_event

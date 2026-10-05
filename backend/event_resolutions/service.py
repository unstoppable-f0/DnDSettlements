from typing import Annotated

from fastapi import Query
from sqlmodel import select

from backend.assets.service import recalculate_assets
from backend.db.models import (
    AssetModel,
    ChooseEventResolution,
    CreateEventResolution,
    EventResolution,
    SessionDep,
)
from backend.events.service import resolve_event


async def read_all_event_resolutions(session: SessionDep,
                                     offset: int = 0,
                                     limit: Annotated[int, Query(le=100)] = 100) -> list[EventResolution]:

    all_event_resolutions = session.exec(select(EventResolution).offset(offset).limit(limit)).all()
    return all_event_resolutions


async def read_event_resolutions_by_id(event_id: int,
                                       session: SessionDep,
                                       offset: int = 0,
                                       limit: Annotated[int, Query(le=100)] = 100) -> list[EventResolution]:

    event_resolutions_by_campaign = session.exec(select(EventResolution).where(EventResolution.event_id == event_id).
                                           offset(offset).limit(limit)).all()

    return event_resolutions_by_campaign


async def read_chosen_resolution_by_event_id(event_id: int, session: SessionDep) -> EventResolution:

    chosen_resolution = session.exec(select(EventResolution).where(EventResolution.event_id == event_id)
                                     .where(EventResolution.chosen == True)).one()

    return chosen_resolution


async def read_many_chosen_resolutions(event_ids: list[int],
                                       session: SessionDep,
                                       offset: int = 0,
                                       limit: Annotated[int, Query(le=100)] = 100
                                       ) -> list[EventResolution]:

    chosen_resolutions = session.exec(select(EventResolution).where(EventResolution.chosen == True)
                            .where(EventResolution.event_id.in_(event_ids)).offset(offset).limit(limit)).all()


    return chosen_resolutions



async def make_event_resolution(event_resolution: CreateEventResolution, session: SessionDep) -> EventResolution:

    db_event_resolution = EventResolution.model_validate(event_resolution)
    session.add(db_event_resolution)
    session.commit()
    session.refresh(db_event_resolution)

    return db_event_resolution


async def mark_as_chosen_resolution(event_resolution_id: int, session: SessionDep) -> EventResolution:
    db_event_resolution = session.get(EventResolution, event_resolution_id)

    new_event_resolution_data = ChooseEventResolution().model_dump()
    db_event_resolution.sqlmodel_update(new_event_resolution_data)
    session.commit()
    session.refresh(db_event_resolution)

    return db_event_resolution


async def decide_the_event_resolution(event_resolution_id: int, session: SessionDep) -> EventResolution:

    """
    Handler for handling all event resolution logic:
    1) Choose the exact event resolution
    2) Mark the event as resolved
    3) Calculate and update the Settlement's assets
    """

    # UPDATE (PUT) the chosen event resolution. Grab the updated model
    event_resolution = await mark_as_chosen_resolution(event_resolution_id, session)
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

from typing import Annotated

from fastapi import APIRouter, Query
from sqlmodel import select
from backend.db.models import SessionDep, Settlement, CreateSettlement


settlements_router = APIRouter()


@settlements_router.get('/settlements/', response_model=list[Settlement])
async def get_all_settlements(session: SessionDep, offset: int = 0, limit: Annotated[int, Query(le=100)] = 100):
    all_settlements = session.exec(select(Settlement).offset(offset).limit(limit)).all()
    return all_settlements


@settlements_router.get('/settlements/{campaign}', response_model=list[Settlement])
async def get_settlements_by_campaign(campaign: str,
                                      session: SessionDep,
                                      offset: int = 0,
                                      limit: Annotated[int, Query(le=100)] = 100):


    settlements_by_campaign = session.exec(select(Settlement).where(Settlement.campaign == campaign).
                                           offset(offset).limit(limit)).all()

    return settlements_by_campaign



@settlements_router.post('/settlements', response_model=Settlement)
async def create_settlement(settlement: CreateSettlement, session: SessionDep):
    db_settlement = Settlement.model_validate(settlement)
    session.add(db_settlement)
    session.commit()
    session.refresh(db_settlement)

    return db_settlement
from typing import Annotated

from fastapi import Query
from sqlalchemy.exc import IntegrityError
from sqlmodel import select

from backend.db.models import CreateSettlement, SessionDep, Settlement


async def read_all_settlements(session: SessionDep,
                               offset: int = 0,
                               limit: Annotated[int, Query(le=100)] = 100) -> list[Settlement]:

    all_settlements = session.exec(select(Settlement).offset(offset).limit(limit)).all()
    return all_settlements


async def read_one_settlement(settlement_id: int, session: SessionDep) -> Settlement:
    settlement = session.get(Settlement, settlement_id)

    return settlement


async def read_settlements_by_campaign(campaign: str,
                                       session: SessionDep,
                                       offset: int = 0,
                                       limit: Annotated[int, Query(le=100)] = 100) -> list[Settlement]:


    settlements_by_campaign = session.exec(select(Settlement).where(Settlement.campaign == campaign).
                                           offset(offset).limit(limit)).all()

    return settlements_by_campaign


async def make_new_settlement(settlement: CreateSettlement, session: SessionDep) -> Settlement:
    db_settlement = Settlement.model_validate(settlement)
    session.add(db_settlement)
    try:
        session.commit()
        session.refresh(db_settlement)
    except IntegrityError as exc:
        session.rollback()
        print(exc)


    return db_settlement
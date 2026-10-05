from fastapi import APIRouter, HTTPException

from backend.db.models import CreateSettlement, SessionDep, Settlement
from backend.settlements.service import (make_new_settlement,
                                         read_all_settlements,
                                         read_one_settlement,
                                         read_settlements_by_campaign)

settlements_router = APIRouter(
    prefix="/settlements",
    tags=['settlements']
)


@settlements_router.get('/', response_model=list[Settlement])
async def get_all_settlements(session: SessionDep):
    all_settlements = await read_all_settlements(session)
    return all_settlements


@settlements_router.get('/{settlement_id}', response_model=Settlement)
async def get_settlement(settlement_id: int, session: SessionDep):
    settlement = await read_one_settlement(settlement_id, session)
    if not settlement:
        raise HTTPException(status_code=404, detail="Settlement not found")

    return settlement


@settlements_router.get('/campaigns/{campaign}', response_model=list[Settlement])
async def get_settlements_by_campaign(campaign: str, session: SessionDep):
    settlements_by_campaign = await read_settlements_by_campaign(campaign, session)

    return settlements_by_campaign



@settlements_router.post('/', response_model=Settlement)
async def create_settlement(settlement: CreateSettlement, session: SessionDep):
    new_settlement = await make_new_settlement(settlement, session)

    return new_settlement
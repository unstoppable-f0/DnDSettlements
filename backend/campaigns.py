from typing import Annotated

from fastapi import APIRouter, Query
from sqlmodel import select

from backend.db.models import Campaign, CreateCampaign, SessionDep

campaigns_router = APIRouter(
    prefix="/campaigns",
    tags=['campaigns']
)


@campaigns_router.get('/', response_model=list[Campaign])
async def get_all_campaigns(session: SessionDep, offset: int = 0, limit: Annotated[int, Query(le=100)] = 100):
    all_campaigns = session.exec(select(Campaign).offset(offset).limit(limit)).all()
    return all_campaigns


@campaigns_router.post('/', response_model=Campaign)
async def create_campaign(campaign: CreateCampaign, session: SessionDep):
    db_campaign = Campaign.model_validate(campaign)
    session.add(db_campaign)
    session.commit()
    session.refresh(db_campaign)

    return db_campaign
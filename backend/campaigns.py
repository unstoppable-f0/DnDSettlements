from typing import Annotated

from fastapi import APIRouter, Query, HTTPException
from sqlmodel import select

from backend.db.models import Campaign, CampaignNameUpdate, SessionDep

campaigns_router = APIRouter(
    prefix="/campaigns",
    tags=['campaigns']
)


@campaigns_router.get('/', response_model=list[Campaign])
async def get_all_campaigns(session: SessionDep, offset: int = 0, limit: Annotated[int, Query(le=100)] = 100):
    all_campaigns = session.exec(select(Campaign).offset(offset).limit(limit)).all()
    return all_campaigns


@campaigns_router.post('/', response_model=Campaign)
async def create_campaign(campaign: CampaignNameUpdate, session: SessionDep):
    db_campaign = Campaign.model_validate(campaign)
    session.add(db_campaign)
    session.commit()
    session.refresh(db_campaign)

    return db_campaign


@campaigns_router.patch('/{campaign_id}', response_model=Campaign)
async def change_campaign_name(campaign_id: int, campaign: CampaignNameUpdate, session: SessionDep):
    db_campaign = session.get(Campaign, campaign_id)

    if not db_campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    new_campaign_data = campaign.model_dump(exclude_unset=True)
    db_campaign.sqlmodel_update(new_campaign_data)
    session.commit()
    session.refresh(db_campaign)
    return db_campaign


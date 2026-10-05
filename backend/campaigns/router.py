from fastapi import APIRouter, HTTPException

from backend.campaigns.service import (
    begin_campaign,
    change_campaign_name,
    read_all_campaigns,
    read_campaign,
)
from backend.db.models import Campaign, CampaignNameUpdate, SessionDep

campaigns_router = APIRouter(
    prefix="/campaigns",
    tags=['campaigns']
)


@campaigns_router.get('/{campaign_id}', response_model=Campaign)
async def get_campaign(campaign_id: int, session: SessionDep):
    campaign = await read_campaign(campaign_id, session)

    if not campaign:
        raise HTTPException(status_code=404, detail='Campaign not found')

    return campaign


@campaigns_router.get('/', response_model=list[Campaign])
async def get_all_campaigns(session: SessionDep):
    all_campaigns = await read_all_campaigns(session)
    if not all_campaigns:
        raise HTTPException(status_code=404, detail='No campaigns found')

    return all_campaigns


@campaigns_router.post('/', response_model=Campaign)
async def create_campaign(campaign: CampaignNameUpdate, session: SessionDep):
    db_campaign = await begin_campaign(campaign, session)
    if not db_campaign:
        raise HTTPException(status_code=404, detail='Campaign not found')

    return db_campaign


@campaigns_router.patch('/{campaign_id}', response_model=Campaign)
async def update_campaign_name(campaign_id: int, campaign: CampaignNameUpdate, session: SessionDep):
    db_campaign = await change_campaign_name(campaign_id, campaign, session)

    if not db_campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return db_campaign


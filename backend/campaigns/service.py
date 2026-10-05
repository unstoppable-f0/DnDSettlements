from typing import Annotated

from fastapi import HTTPException, Query
from sqlmodel import select

from backend.db.models import Campaign, CampaignNameUpdate, SessionDep


async def read_campaign(campaign_id: int, session: SessionDep) -> Campaign:
    campaign = session.get(Campaign, campaign_id)

    return campaign


async def read_all_campaigns(session: SessionDep,
                             offset: int = 0,
                             limit: Annotated[int, Query(le=100)] = 100) -> list[Campaign]:

    all_campaigns = session.exec(select(Campaign).offset(offset).limit(limit)).all()
    return all_campaigns


async def begin_campaign(campaign: CampaignNameUpdate, session: SessionDep) -> Campaign:
    db_campaign = Campaign.model_validate(campaign)
    session.add(db_campaign)
    session.commit()
    session.refresh(db_campaign)

    return db_campaign


async def change_campaign_name(campaign_id: int, campaign: CampaignNameUpdate, session: SessionDep) -> Campaign:
    db_campaign = session.get(Campaign, campaign_id)

    if not db_campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    new_campaign_data = campaign.model_dump(exclude_unset=True)
    db_campaign.sqlmodel_update(new_campaign_data)
    session.commit()
    session.refresh(db_campaign)
    return db_campaign
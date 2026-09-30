from typing import Annotated

from fastapi import APIRouter, Query
from sqlmodel import select

from backend.db.models import Asset, ChangeAsset, SessionDep, Settlement

assets_router = APIRouter(
    prefix='/assets',
    tags=['assets']
)


@assets_router.get('/', response_model=list[Asset])
async def get_all_assets(session: SessionDep, offset: int = 0, limit: Annotated[int, Query(le=100)] = 100):
    all_assets = session.exec(select(Asset).offset(offset).limit(limit)).all()
    return all_assets


@assets_router.get('/{settlement_id}', response_model=list[Asset])
async def get_assets_by_settlement_id(settlement_id: int,
                                      session: SessionDep,
                                      offset: int = 0,
                                      limit: Annotated[int, Query(le=100)] = 100):


    assets_by_campaign = session.exec(select(Asset).where(Asset.id == settlement_id).
                                           offset(offset).limit(limit)).all()

    return assets_by_campaign



@assets_router.post('/', response_model=Asset)
async def create_assets(asset: ChangeAsset, session: SessionDep):
    db_asset = Asset.model_validate(asset)
    session.add(db_asset)
    session.commit()
    session.refresh(db_asset)

    return db_asset


async def recalculate_assets(settlement_id: int, new_assets: ChangeAsset, session: SessionDep):
    """Recalculate assets of a settlement because of events/event resolutions/ buildings."""

    settlement_assets = session.get(Asset, settlement_id)
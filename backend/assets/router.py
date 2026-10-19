from fastapi import APIRouter, HTTPException

from backend.assets.service import (
    make_assets,
    read_all_assets,
    read_assets_by_settlement_id,
    renew_assets_by_settlement_id,
    make_settlement_coffers_donation,
    withdraw_from_settlement_coffers,
)
from backend.db.models import Asset, AssetModel, SessionDep

assets_router = APIRouter(
    prefix='/assets',
    tags=['assets']
)


@assets_router.get('/', response_model=list[Asset])
async def get_all_assets(session: SessionDep):
    db_all_assets = await read_all_assets(session)
    if not db_all_assets:
        raise HTTPException(status_code=404, detail='Assets not found')

    return db_all_assets


@assets_router.get('/{settlement_id}', response_model=AssetModel)
async def get_assets_by_settlement_id(settlement_id: int, session: SessionDep):
    assets_of_settlement = await read_assets_by_settlement_id(settlement_id, session)
    if not assets_of_settlement:
        raise HTTPException(status_code=404, detail='Assets not found')

    return assets_of_settlement


@assets_router.put('/{settlement_id}', response_model=AssetModel)
async def update_assets_by_settlement_id(settlement_id: int, asset: AssetModel, session: SessionDep):
    db_assets = await renew_assets_by_settlement_id(settlement_id, asset, session)
    return db_assets


@assets_router.post('/', response_model=Asset)
async def create_assets(asset: Asset, session: SessionDep):
    db_asset = await make_assets(asset, session)
    return db_asset


@assets_router.patch('/coffers_donation/{settlement_id}', response_model=AssetModel)
async def make_coffers_donation(settlement_id: int, donated_gold: int, session: SessionDep):
    settlement_assets = await make_settlement_coffers_donation(settlement_id, donated_gold, session)
    return settlement_assets


@assets_router.patch('/coffers_withdrawal/{settlement_id}', response_model=AssetModel)
async def make_coffers_withdrawal(settlement_id: int, withdrawn_gold: int, session: SessionDep):
    settlement_assets = await withdraw_from_settlement_coffers(settlement_id, withdrawn_gold, session)
    return settlement_assets

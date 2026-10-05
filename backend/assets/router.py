from fastapi import APIRouter, HTTPException

from backend.assets.service import (
    make_assets,
    read_all_assets,
    read_assets_by_settlement_id,
    renew_assets_by_settlement_id,
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
    if not db_assets:
        raise HTTPException(status_code=404, detail='Assets not found and not upgraded')

    return db_assets


@assets_router.post('/', response_model=Asset)
async def create_assets(asset: Asset, session: SessionDep):
    db_asset = await make_assets(asset, session)

    return db_asset

from typing import Annotated

from fastapi import APIRouter, HTTPException, Query
from sqlmodel import select

from backend.db.models import Asset, AssetModel, SessionDep

assets_router = APIRouter(
    prefix='/assets',
    tags=['assets']
)


@assets_router.get('/', response_model=list[Asset])
async def get_all_assets(session: SessionDep, offset: int = 0, limit: Annotated[int, Query(le=100)] = 100):
    all_assets = session.exec(select(Asset).offset(offset).limit(limit)).all()
    return all_assets


@assets_router.get('/{settlement_id}', response_model=AssetModel)
async def get_assets_by_settlement_id(settlement_id: int, session: SessionDep):
    assets_of_settlement = session.get(Asset, settlement_id)
    return assets_of_settlement


@assets_router.put('/{settlement_id}', response_model=AssetModel)
async def update_assets_by_settlement_id(settlement_id: int, asset: AssetModel, session: SessionDep):
    db_assets = session.get(Asset, settlement_id)
    if not db_assets:
        raise HTTPException(status_code=404, detail='Event resolution not found')

    new_assets_data = asset.model_dump(exclude_unset=True)
    db_assets.sqlmodel_update(new_assets_data)
    session.commit()
    session.refresh(db_assets)

    return db_assets



@assets_router.post('/', response_model=Asset)
async def create_assets(asset: Asset, session: SessionDep):
    db_asset = Asset.model_validate(asset)
    session.add(db_asset)
    session.commit()
    session.refresh(db_asset)

    return db_asset


async def recalculate_assets(settlement_id: int, new_assets: AssetModel, session: SessionDep):
    """Recalculate assets of a settlement because of events/event resolutions/ buildings."""

    old_settlement_assets = await get_assets_by_settlement_id(settlement_id, session)

    recalculated_assets = AssetModel(
        income=old_settlement_assets.income + new_assets.income,
        coffers=old_settlement_assets.coffers + new_assets.coffers,
        resources=old_settlement_assets.resources + new_assets.resources,
        defence=old_settlement_assets.defence + new_assets.defence,
    )

    updated_assets = await update_assets_by_settlement_id(settlement_id, recalculated_assets, session)

    return updated_assets



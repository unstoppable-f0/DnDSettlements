from typing import Annotated

from fastapi import Query
from sqlmodel import select

from backend.db.models import Asset, AssetModel, SessionDep


async def read_all_assets(session: SessionDep,
                          offset: int = 0,
                          limit: Annotated[int, Query(le=100)] = 100) -> list[Asset]:

    db_all_assets = session.exec(select(Asset).offset(offset).limit(limit)).all()
    return db_all_assets


async def read_assets_by_settlement_id(settlement_id: int, session: SessionDep) -> Asset:
    settlement_assets = session.get(Asset, settlement_id)
    return settlement_assets


async def make_assets(asset: Asset, session: SessionDep) -> Asset:
    db_asset = Asset.model_validate(asset)
    session.add(db_asset)
    session.commit()
    session.refresh(db_asset)

    return db_asset


async def renew_assets_by_settlement_id(settlement_id: int, asset: AssetModel, session: SessionDep) -> Asset:
    """Update assets of settlement in the result of some action (event resolution, building project, etc.)."""

    settlement_assets = await read_assets_by_settlement_id(settlement_id, session)

    new_assets_data = asset.model_dump(exclude_unset=True)
    settlement_assets.sqlmodel_update(new_assets_data)
    session.commit()
    session.refresh(settlement_assets)

    return settlement_assets


async def recalculate_assets(settlement_id: int, new_assets: AssetModel, session: SessionDep) -> Asset:
    """Recalculate assets of a settlement because of events/event resolutions/ buildings."""

    old_settlement_assets = await read_assets_by_settlement_id(settlement_id, session)

    recalculated_assets = AssetModel(
        income=old_settlement_assets.income + new_assets.income,
        coffers=old_settlement_assets.coffers + new_assets.coffers,
        resources=old_settlement_assets.resources + new_assets.resources,
        defence=old_settlement_assets.defence + new_assets.defence,
    )

    updated_assets = await renew_assets_by_settlement_id(settlement_id, recalculated_assets, session)

    return updated_assets
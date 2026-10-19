from typing import Annotated

from fastapi import Query, HTTPException
from sqlmodel import select

from backend.db.models import Asset, AssetModel, SessionDep


async def read_all_assets(session: SessionDep,
                          offset: int = 0,
                          limit: Annotated[int, Query(le=100)] = 100) -> list[Asset] | None:

    result = await session.exec(select(Asset).offset(offset).limit(limit))
    db_all_assets = result.all()
    return db_all_assets


async def read_assets_by_settlement_id(settlement_id: int, session: SessionDep) -> Asset | None:
    settlement_assets = await session.get(Asset, settlement_id)
    return settlement_assets


async def make_assets(asset: Asset, session: SessionDep) -> Asset:
    db_asset = Asset.model_validate(asset)
    session.add(db_asset)
    await session.commit()
    await session.refresh(db_asset)

    return db_asset


async def make_settlement_coffers_donation(settlement_id: int, donated_gold: int, session: SessionDep) -> Asset:
    """Donate money into the settlement's coffers."""

    settlement_assets = await read_assets_by_settlement_id(settlement_id, session)
    if not settlement_assets:
        raise HTTPException(status_code=404, detail="Settlement not found")

    settlement_assets.coffers += donated_gold
    settlement_assets.sqlmodel_update(settlement_assets.model_dump())
    await session.commit()
    await session.refresh(settlement_assets)

    return settlement_assets


async def withdraw_from_settlement_coffers(settlement_id: int, withdrawn_gold: int, session: SessionDep) -> Asset:
    """Withdraw money from the settlement's coffers."""

    settlement_assets = await read_assets_by_settlement_id(settlement_id, session)
    if not settlement_assets:
        raise HTTPException(status_code=404, detail='Settlement assets not found')

    left_money = settlement_assets.coffers - withdrawn_gold
    if left_money >= 0:
        settlement_assets.coffers = left_money
        settlement_assets.sqlmodel_update(settlement_assets.model_dump())
        await session.commit()
        await session.refresh(settlement_assets)

        return settlement_assets

    else:
        raise HTTPException(status_code=409, detail='This will bring coffers lower than zero.')


async def renew_assets_by_settlement_id(settlement_id: int, asset: AssetModel, session: SessionDep) -> Asset:
    """Update assets of settlement in the result of some action (event resolution, building project, etc.)."""

    settlement_assets = await read_assets_by_settlement_id(settlement_id, session)
    if not settlement_assets:
        raise HTTPException(status_code=404, detail='Settlement assets not found')

    new_assets_data = asset.model_dump(exclude_unset=True)
    settlement_assets.sqlmodel_update(new_assets_data)
    await session.commit()
    await session.refresh(settlement_assets)

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
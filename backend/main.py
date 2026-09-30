from contextlib import asynccontextmanager

from fastapi import FastAPI, Request

from backend.assets import assets_router
from backend.campaigns import campaigns_router
from backend.db.models import Campaign, SessionDep, create_db_and_tables
from backend.event_resolutions import event_resolutions_router
from backend.events import events_router
from backend.settlements import settlements_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)
app.include_router(campaigns_router)
app.include_router(settlements_router)
app.include_router(events_router)
app.include_router(event_resolutions_router)
app.include_router(assets_router)

@app.get("/")
async def root():
    """Main Page"""
    return {"Hello": "World"}

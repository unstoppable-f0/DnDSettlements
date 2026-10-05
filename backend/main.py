from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.assets.router import assets_router
from backend.buildings.router import buildings_router
from backend.campaigns.router import campaigns_router
from backend.db.models import create_db_and_tables
from backend.event_resolutions import event_resolutions_router
from backend.events import events_router
from backend.settlements import settlements_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_db_and_tables()
    yield

origins = ['http://localhost:5173']

app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(campaigns_router)
app.include_router(settlements_router)
app.include_router(events_router)
app.include_router(event_resolutions_router)
app.include_router(assets_router)
app.include_router(buildings_router)

@app.get("/")
async def root():
    """Main Page"""
    return {"Hello": "World"}

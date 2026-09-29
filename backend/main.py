from contextlib import asynccontextmanager
from fastapi import FastAPI, Request

from backend.campaigns import campaigns_router
from backend.settlements import settlements_router
from backend.db.models import SessionDep, create_db_and_tables, Campaign


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)
app.include_router(campaigns_router)
app.include_router(settlements_router)

@app.get("/")
async def root():
    """Main Page"""
    return {"Hello": "World"}


@app.get("/items/{item_id}")
async def read_item(item_id: int, q: str | None = None):
    return {"item_id": item_id, "q": q}

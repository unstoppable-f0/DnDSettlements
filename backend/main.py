from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse

app = FastAPI()
# app.frontend('/', directory='frontend', fallback='index.html', check_dir=True)
front = Jinja2Templates(directory='frontend')



@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    # return {"Hello": "World"}
    return front.TemplateResponse(
        request=request,
        name='index.html'
    )


@app.get("/items/{item_id}")
async def read_item(item_id: int, q: str | None = None):
    return {"item_id": item_id, "q": q}
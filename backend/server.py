from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

EXPRESS_URL = os.environ.get("EXPRESS_URL", "http://127.0.0.1:3000")

@app.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_api(path: str, request: Request):
    async with httpx.AsyncClient() as client:
        url = f"{EXPRESS_URL}/api/{path}"
        
        # Forward the request
        body = await request.body()
        headers = dict(request.headers)
        headers.pop("host", None)
        
        try:
            response = await client.request(
                method=request.method,
                url=url,
                content=body,
                headers=headers,
                timeout=30.0
            )
            
            return Response(
                content=response.content,
                status_code=response.status_code,
                headers=dict(response.headers),
                media_type=response.headers.get("content-type")
            )
        except Exception as e:
            return Response(
                content=f'{{"error": "{str(e)}"}}',
                status_code=500,
                media_type="application/json"
            )

@app.get("/health")
async def health():
    return {"status": "ok"}

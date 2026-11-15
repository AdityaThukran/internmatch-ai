from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import resume_routes, matching_routes
import uvicorn

app = FastAPI(title="AI Internship Matcher Service", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(resume_routes.router, prefix="/api")
app.include_router(matching_routes.router, prefix="/api")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "AI Internship Matcher"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

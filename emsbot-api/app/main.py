from .deps import create_app
from .routers import vision, signals, audio, risk, nlp

app = create_app()

app.include_router(vision.router)
app.include_router(signals.router)
app.include_router(audio.router)
app.include_router(risk.router)
app.include_router(nlp.router)

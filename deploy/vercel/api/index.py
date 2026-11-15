"""WSGI entrypoint consumed by the official Vercel Python runtime."""
from paddock_service.app import create_app

app = create_app()

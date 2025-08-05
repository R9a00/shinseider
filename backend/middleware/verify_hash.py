import hashlib
import hmac
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

class VerifyHashMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, secret_key: str):
        super().__init__(app)
        self.secret_key = secret_key.encode('utf-8')

    async def dispatch(self, request: Request, call_next):
        if request.method in ["POST", "PUT", "PATCH"]:
            x_hub_signature = request.headers.get('X-Hub-Signature-256')
            if not x_hub_signature:
                return Response(content="Missing X-Hub-Signature-256 header", status_code=400)

            body = await request.body()
            expected_signature = "sha256=" + hmac.new(self.secret_key, body, hashlib.sha256).hexdigest()

            if not hmac.compare_digest(x_hub_signature, expected_signature):
                return Response(content="Invalid signature", status_code=400)

        response = await call_next(request)
        return response
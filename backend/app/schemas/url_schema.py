from pydantic import BaseModel


class URLScanRequest(BaseModel):
    url: str
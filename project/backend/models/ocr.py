from pydantic import BaseModel


class OcrRow(BaseModel):
    file: str
    center_freq_ghz: float | None = None
    marker_freq_ghz: float | None = None
    marker_power_uw: float | None = None
    timestamp: str | None = None
    status: str

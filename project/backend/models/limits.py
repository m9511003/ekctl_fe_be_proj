from pydantic import BaseModel
from typing import Literal


class LimitRow(BaseModel):
    freq_min_mhz: float
    freq_max_mhz: float
    limit_dbuv_m: float


class LimitsResponse(BaseModel):
    rows: list[LimitRow]
    source: Literal["default", "user"]


class LimitsPutRequest(BaseModel):
    rows: list[LimitRow]

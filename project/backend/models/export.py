from pydantic import BaseModel, ConfigDict, Field


class JudgeRowIn(BaseModel):
    no: int
    file: str
    freq_mhz: float
    power_uw: float
    dbm: float
    dbuv_m: float
    limit: float | None = None
    margin: float | None = None
    verdict: str


class JudgeSummaryIn(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    total: int
    pass_count: int = Field(alias="pass")
    fail: int
    verdict: str


class ExportRequest(BaseModel):
    rows: list[JudgeRowIn]
    summary: JudgeSummaryIn
    cf_db: float
    tester: str = ""
    sample_name: str = ""
    reviewer: str = ""
